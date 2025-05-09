const db = require("../models/db.model")
const helper = require("../utils/helper.util")

async function get(schedule_id, user_id) {
    console.log('Getting seats for schedule:', schedule_id, 'user:', user_id);
    
    const seats = await db.query(`
        SELECT 
            z.name AS zone_name,
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
        FROM seat s
        JOIN zone z ON s.zone_id = z.id
        LEFT JOIN ticket t 
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
        FROM seat s
        LEFT JOIN ticket t ON t.seat_id = s.id AND t.schedule_id = ?
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
         FROM ticket t 
         LEFT JOIN seat s ON t.seat_id = s.id 
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
            `SELECT id FROM ticket 
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
            FROM seat s
            LEFT JOIN ticket t ON t.seat_id = s.id AND t.schedule_id = ?
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
            `INSERT INTO ticket (user_id, seat_id, schedule_id, status) 
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
            `SELECT id FROM ticket 
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
            `DELETE FROM ticket 
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
        
        // First validate all tickets
        const ticketCheck = await db.query(
            `SELECT id, status, confirmed 
             FROM ticket 
             WHERE id IN (${ticket_ids.join(',')}) 
             AND user_id = ? 
             AND status = 'selected' 
             AND confirmed = 0`,
            [user_id]
        );
        
        console.log('Ticket validation result:', ticketCheck);
        
        if (!ticketCheck || ticketCheck.length === 0) {
            console.log('No valid tickets found');
            await db.query('ROLLBACK');
            const error = new Error("No valid tickets found for the selected seats");
            error.statusCode = 400;
            throw error;
        }
        
        if (ticketCheck.length !== ticket_ids.length) {
            console.log('Some tickets are invalid or already booked');
            await db.query('ROLLBACK');
            const error = new Error("Some tickets are invalid or already booked");
            error.statusCode = 400;
            throw error;
        }
        
        // Update all tickets to booked status
        const result = await db.query(
            `UPDATE ticket 
             SET status = 'booked', confirmed = 1 
             WHERE id IN (${ticket_ids.join(',')}) 
             AND user_id = ? 
             AND status = 'selected' 
             AND confirmed = 0`,
            [user_id]
        );
        
        console.log('Update result:', result);
        
        if (result.affectedRows !== ticket_ids.length) {
            console.log('Not all tickets were updated');
            await db.query('ROLLBACK');
            const error = new Error("Failed to book all tickets");
            error.statusCode = 400;
            throw error;
        }
        
        await db.query('COMMIT');
        return { message: 'Success' };
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