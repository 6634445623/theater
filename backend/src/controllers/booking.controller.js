const db = require('../models/db.model');
const { requireAdmin } = require('../middlewares/auth.middleware');

async function getMultiple(req, res, next) {
    try {
        const userId = req.user.id;
        const bookings = db.query(`
            SELECT 
                b.id,
                b.schedule_id as scheduleId,
                m.name as movie_name,
                m.poster as movie_poster,
                s.date,
                b.total_amount,
                b.payment_method,
                b.status,
                GROUP_CONCAT(bs.row || '-' || bs.number) as seats
            FROM bookings b
            JOIN schedule s ON b.schedule_id = s.id
            JOIN movie m ON s.movie_id = m.id
            JOIN booking_seats bs ON b.id = bs.booking_id
            WHERE b.user_id = ?
            GROUP BY b.id
            ORDER BY b.created_at DESC
        `, [userId]);

        // Parse the seats string into an array of objects
        const formattedBookings = bookings.map(booking => ({
            ...booking,
            seats: booking.seats ? booking.seats.split(',').map(seat => {
                const [row, number] = seat.split('-');
                return { row, number };
            }) : []
        }));

        res.json(formattedBookings);
    } catch (err) {
        console.error(`Error while getting bookings`, err.message);
        next(err);
    }
}

async function getAllBookings(req, res, next) {
    try {
        requireAdmin(req, res, async () => {
            const bookings = await db.query(`
                SELECT 
                    b.id,
                    b.schedule_id as scheduleId,
                    m.name as movie_name,
                    m.poster as movie_poster,
                    s.date,
                    b.total_amount,
                    b.payment_method,
                    b.status,
                    GROUP_CONCAT(bs.row || '-' || bs.number) as seats
                FROM bookings b
                JOIN schedule s ON b.schedule_id = s.id
                JOIN movie m ON s.movie_id = m.id
                JOIN booking_seats bs ON b.id = bs.booking_id
                GROUP BY b.id
                ORDER BY b.created_at DESC
            `);

            // Parse the seats string into an array of objects
            const formattedBookings = bookings.map(booking => ({
                ...booking,
                seats: booking.seats ? booking.seats.split(',').map(seat => {
                    const [row, number] = seat.split('-');
                    return { row, number };
                }) : []
            }));

            res.json(formattedBookings);
        });
    } catch (err) {
        console.error(`Error while getting all bookings`, err.message);
        next(err);
    }
}

async function getById(req, res, next) {
    try {
        const userId = req.user.id;
        const bookingId = req.params.id;

        const bookings = db.query(`
            SELECT 
                b.id,
                b.schedule_id as scheduleId,
                m.name as movie_name,
                m.poster as movie_poster,
                s.date,
                b.total_amount,
                b.payment_method,
                b.status,
                GROUP_CONCAT(bs.row || '-' || bs.number) as seats
            FROM bookings b
            JOIN schedule s ON b.schedule_id = s.id
            JOIN movie m ON s.movie_id = m.id
            JOIN booking_seats bs ON b.id = bs.booking_id
            WHERE b.id = ? AND b.user_id = ?
            GROUP BY b.id
        `, [bookingId, userId]);

        if (!bookings || bookings.length === 0) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }

        const booking = bookings[0];

        // Parse the seats string into an array of objects
        const formattedBooking = {
            ...booking,
            seats: booking.seats ? booking.seats.split(',').map(seat => {
                const [row, number] = seat.split('-');
                return { row, number };
            }) : []
        };

        res.json(formattedBooking);
    } catch (err) {
        console.error(`Error while getting booking`, err.message);
        next(err);
    }
}

module.exports = {
    getMultiple,
    getAllBookings,
    getById
} 