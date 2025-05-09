const db = require("../models/db.model")
const helper = require("../utils/helper.util")

async function get(schedule_id, user_id) {
    console.log('Getting seats for schedule:', schedule_id, 'user:', user_id);
    
    const seats = await db.query(`
        SELECT 
            z.name AS zone_name,
            z.price,
            s.id AS seat_id,
            s.is_spacer,
            s.row,
            s.column,
            s.is_reserve,
            t.id as ticket_id,
            t.user_id,
            CASE
                WHEN s.is_reserve = 0 AND (
                    t.id IS NULL OR 
                    t.user_id = ? OR 
                    (t.status = 'selected' AND t.confirmed = 0 AND t.user_id = ? AND DATETIME(t.created_at, '+15 minutes') > DATETIME('now'))
                ) THEN 1
                ELSE 0
            END AS available
        FROM seats s
        JOIN zones z ON s.zone_id = z.id
        LEFT JOIN tickets t 
            ON t.seat_id = s.id AND t.schedule_id = ?
        ORDER BY 
            z.name ASC,
            s.row ASC,
            s.column ASC;
    `, [user_id, user_id, schedule_id])

    console.log('Raw seat data:', JSON.stringify(seats, null, 2));
    const formattedSeats = helper.formatSeats(seats);
    console.log('Formatted seats:', JSON.stringify(formattedSeats, null, 2));
    
    const result = helper.emptyOrRows(formattedSeats);
    console.log('Final result:', JSON.stringify(result, null, 2));
    return result;
}

async function valid(seat_id, schedule_id, user_id) {
    console.log('Validating seat:', { seat_id, schedule_id, user_id });
    
    const seats = await db.query(`
        SELECT 
            s.id,
            s.is_reserve,
            t.id as ticket_id,
            t.user_id,
            t.status,
            t.confirmed,
            t.created_at,
            CASE
                WHEN s.is_reserve = 0 AND (
                    t.id IS NULL OR 
                    t.user_id = ? OR 
                    (t.status = 'selected' AND t.confirmed = 0 AND t.user_id = ? AND DATETIME(t.created_at, '+15 minutes') > DATETIME('now'))
                ) THEN 1
                ELSE 0
            END AS available
        FROM seats s
        LEFT JOIN tickets t ON t.seat_id = s.id AND t.schedule_id = ?
        WHERE s.id = ?
    `, [user_id, user_id, schedule_id, seat_id])

    console.log('Seat validation result:', seats);

    if (!seats || seats.length === 0) {
        console.log('Seat not found');
        return { available: 0 };
    }

    const seat = seats[0];
    const isAvailable = seat.available === 1;

    console.log('Seat availability:', { 
        seat_id, 
        is_reserve: seat.is_reserve, 
        ticket_id: seat.ticket_id,
        user_id: seat.user_id,
        isAvailable 
    });

    return { available: isAvailable ? 1 : 0 };
}

async function getTempTicket(user_id, schedule_id) {
    console.log('Getting temp tickets for user:', user_id, 'schedule:', schedule_id);
    const tickets = await db.query(
        `SELECT t.id as ticketId, t.seat_id as seatId, s.row as \`row\` 
         FROM tickets t 
         LEFT JOIN seats s ON t.seat_id = s.id 
         WHERE t.user_id = ? AND t.schedule_id = ? AND t.confirmed = 0 AND t.status = 'selected'`,
        [user_id, schedule_id]
    );
    console.log('Raw temp tickets:', tickets);
    const result = helper.emptyOrRows(tickets);
    console.log('Processed temp tickets:', result);
    return Array.isArray(result) ? result : [];
}

async function selectSeat(user_id, seat_id, schedule_id) {
    console.log('Selecting seat:', { user_id, seat_id, schedule_id });
    
    try {
        await db.query('BEGIN IMMEDIATE');
        
        // Check if user already has a ticket for this seat
        const existingTicket = await db.query(
            `SELECT id FROM tickets 
             WHERE user_id = ? AND seat_id = ? AND schedule_id = ? AND status = 'selected' AND confirmed = 0`,
            [user_id, seat_id, schedule_id]
        );

        console.log('Existing ticket check:', existingTicket);

        if (existingTicket && existingTicket.length > 0) {
            console.log('User already has a ticket for this seat');
            await db.query('COMMIT');
            return { ticketId: existingTicket[0].id };
        }

        // Check if the seat exists and is available
        const seat = await db.query(`
            SELECT 
                s.id,
                s.is_reserve,
                t.id as ticket_id,
                t.user_id,
                CASE
                    WHEN s.is_reserve = 0 AND (t.id IS NULL OR t.user_id = ?) THEN 1
                    ELSE 0
                END AS available
            FROM seats s
            LEFT JOIN tickets t ON t.seat_id = s.id AND t.schedule_id = ?
            WHERE s.id = ?
        `, [user_id, schedule_id, seat_id]);

        console.log('Seat availability check:', seat);
        
        if (!seat || seat.length === 0) {
            console.log('Seat does not exist');
            await db.query('ROLLBACK');
            const error = new Error("Seat does not exist");
            error.statusCode = 400;
            throw error;
        }

        if (seat[0].is_reserve === 1) {
            console.log('Seat is reserved');
            await db.query('ROLLBACK');
            const error = new Error("Seat is reserved");
            error.statusCode = 400;
            throw error;
        }

        if (seat[0].ticket_id && seat[0].user_id !== user_id) {
            console.log('Seat is already booked by another user');
            await db.query('ROLLBACK');
            const error = new Error("Seat is already booked");
            error.statusCode = 400;
            throw error;
        }

        // Create the ticket with proper status
        const result = await db.query(
            `INSERT INTO tickets (user_id, seat_id, schedule_id, status) 
             VALUES (?, ?, ?, 'selected')`,
            [user_id, seat_id, schedule_id]
        );

        console.log('Created ticket:', result);

        await db.query('COMMIT');
        return { ticketId: result.lastInsertRowid };
    } catch (error) {
        console.error('Error in selectSeat:', error);
        await db.query('ROLLBACK');
        throw error;
    }
}

async function unSelectSeat(user_id, ticket_id) {
    console.log('Unselecting seat:', { user_id, ticket_id });
    
    try {
        await db.query('BEGIN IMMEDIATE');
        
        // First check if the ticket exists and belongs to the user
        const ticketCheck = await db.query(
            `SELECT id FROM tickets 
             WHERE id = ? AND user_id = ? AND status = 'selected' AND confirmed = 0`,
            [ticket_id, user_id]
        );
        
        console.log('Ticket check result:', ticketCheck);
        
        if (!ticketCheck || ticketCheck.length === 0) {
            console.log('Ticket not found or already unselected');
            await db.query('ROLLBACK');
            return { message: 'Ticket not found or already unselected' };
        }
        
        // Delete the ticket
        const result = await db.query(
            `DELETE FROM tickets 
             WHERE id = ? AND user_id = ? AND status = 'selected' AND confirmed = 0`,
            [ticket_id, user_id]
        );
        
        console.log('Delete result:', result);
        
        if (result.affectedRows === 0) {
            console.log('No rows affected during deletion');
            await db.query('ROLLBACK');
            return { message: 'Ticket not found or already unselected' };
        }
        
        await db.query('COMMIT');
        return { message: 'Success' };
    } catch (error) {
        console.error('Error in unSelectSeat:', error);
        await db.query('ROLLBACK');
        throw error;
    }
}

async function book(user_id, ticket_ids) {
    console.log('Booking tickets:', { user_id, ticket_ids });

    try {
        await db.query('BEGIN IMMEDIATE');

        // Get all tickets and their details
        const ticketCheck = await db.query(
            `SELECT 
                t.id,
                t.seat_id,
                t.schedule_id,
                s.row,
                s.column,
                z.price
             FROM tickets t
             JOIN seats s ON t.seat_id = s.id
             JOIN zones z ON s.zone_id = z.id
             WHERE t.id IN (${ticket_ids.join(',')})
             AND t.user_id = ?
             AND t.status = 'selected'
             AND t.confirmed = 0
             AND t.created_at > DATETIME('now', '-15 minutes')`,
            [user_id]
        );

        console.log('Ticket check result:', JSON.stringify(ticketCheck, null, 2));

        if (!ticketCheck || ticketCheck.length === 0) {
            console.log('No valid tickets found');
            await db.query('ROLLBACK');
            const error = new Error("No valid tickets found");
            error.statusCode = 400;
            throw error;
        }

        if (ticketCheck.length !== ticket_ids.length) {
            console.log('Some tickets are no longer valid');
            await db.query('ROLLBACK');
            const error = new Error("Some selected seats are no longer available");
            error.statusCode = 400;
            throw error;
        }

        // Check if any of the seats are now taken by other users
        const seatCheck = await db.query(
            `SELECT t.seat_id, t.user_id, t.created_at
             FROM tickets t
             WHERE t.seat_id IN (${ticketCheck.map(t => t.seat_id).join(',')})
             AND t.schedule_id = ?
             AND t.id NOT IN (${ticket_ids.join(',')})
             AND t.status = 'selected'
             AND t.confirmed = 0
             AND t.created_at > DATETIME('now', '-15 minutes')`,
            [ticketCheck[0].schedule_id]
        );

        console.log('Seat check result:', JSON.stringify(seatCheck, null, 2));

        if (seatCheck && seatCheck.length > 0) {
            console.log('Some seats are now taken by other users');
            await db.query('ROLLBACK');
            const error = new Error("The selected seat is no longer available");
            error.statusCode = 400;
            throw error;
        }

        // Calculate total amount based on zone prices
        const totalAmount = ticketCheck.reduce((sum, ticket) => sum + ticket.price, 0);
        
        // Create booking record
        const bookingResult = await db.query(
            `INSERT INTO bookings (user_id, schedule_id, total_amount, payment_method, status)
             VALUES (?, ?, ?, 'CASH', 'confirmed')`,
            [user_id, ticketCheck[0].schedule_id, totalAmount]
        );
        
        const bookingId = bookingResult.lastInsertRowid;
        
        // Insert booking seats
        for (const ticket of ticketCheck) {
            await db.query(
                `INSERT INTO booking_seats (booking_id, seat_id)
                 VALUES (?, ?)`,
                [bookingId, ticket.seat_id]
            );
        }

        // Update all tickets to confirmed status
        await db.query(
            `UPDATE tickets 
             SET status = 'booked', confirmed = 1
             WHERE id IN (${ticket_ids.join(',')})`
        );

        await db.query('COMMIT');
        return { bookingId };
    } catch (error) {
        console.error('Error in book:', error);
        await db.query('ROLLBACK');
        throw error;
    }
}

module.exports = {
    get,
    valid,
    selectSeat,
    unSelectSeat,
    getTempTicket,
    book
}