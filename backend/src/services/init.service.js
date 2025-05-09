const db = require("../models/db.model");

async function database() {
    try {
        // Enable foreign key support
        await db.query('PRAGMA foreign_keys = ON;');

        // Users table - no dependencies
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                is_admin INTEGER DEFAULT 0
            );
        `);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);`);

        // Theatre table - no dependencies
        await db.query(`
            CREATE TABLE IF NOT EXISTS theatres (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL
            );
        `);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_theatres_name ON theatres(name);`);

        // Movie table - no dependencies
        await db.query(`
            CREATE TABLE IF NOT EXISTS movies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                poster TEXT NOT NULL,
                description TEXT,
                duration INTEGER NOT NULL,
                rating REAL,
                release_date TEXT
            );
        `);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_movies_name ON movies(name);`);

        // Zone table - depends on theatre
        await db.query(`
            CREATE TABLE IF NOT EXISTS zones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                price REAL NOT NULL,
                description TEXT,
                theatre_id INTEGER NOT NULL,
                FOREIGN KEY (theatre_id) REFERENCES theatres(id)
            );
        `);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_zones_theatre ON zones(theatre_id);`);

        // Schedules table - depends on movie and theatre
        await db.query(`
            CREATE TABLE IF NOT EXISTS schedules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                movie_id INTEGER NOT NULL,
                theatre_id INTEGER NOT NULL,
                date TEXT NOT NULL,
                start_time TEXT NOT NULL,
                available INTEGER DEFAULT 1,
                FOREIGN KEY (movie_id) REFERENCES movies(id),
                FOREIGN KEY (theatre_id) REFERENCES theatres(id)
            );
        `);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_schedules_movie ON schedules(movie_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_schedules_theatre ON schedules(theatre_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);`);

        // Seat table - depends on zone
        await db.query(`
            CREATE TABLE IF NOT EXISTS seats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                row INTEGER NOT NULL,
                column INTEGER NOT NULL,
                zone_id INTEGER NOT NULL,
                theatre_id INTEGER NOT NULL,
                is_reserve INTEGER DEFAULT 0,
                is_spacer INTEGER DEFAULT 0,
                FOREIGN KEY (zone_id) REFERENCES zones(id),
                FOREIGN KEY (theatre_id) REFERENCES theatres(id)
            );
        `);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_seats_zone ON seats(zone_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_seats_theatre ON seats(theatre_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_seats_location ON seats(row, column);`);

        // Tickets table - depends on user, seat, and schedule
        await db.query(`
            CREATE TABLE IF NOT EXISTS tickets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                seat_id INTEGER NOT NULL,
                schedule_id INTEGER NOT NULL,
                status TEXT CHECK(status IN ('available', 'selected', 'booked')) DEFAULT 'available',
                confirmed INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (seat_id) REFERENCES seats(id),
                FOREIGN KEY (schedule_id) REFERENCES schedules(id)
            );
        `);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_tickets_seat ON tickets(seat_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_tickets_schedule ON tickets(schedule_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);`);

        // Receipt table - depends on user
        await db.query(`
            CREATE TABLE IF NOT EXISTS receipts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                date DATETIME DEFAULT CURRENT_TIMESTAMP,
                payment_method TEXT NOT NULL CHECK(payment_method IN ('CASH', 'CARD')),
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
        `);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_receipts_user ON receipts(user_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_receipts_date ON receipts(date);`);

        // Receipt items table - depends on receipts and tickets
        await db.query(`
            CREATE TABLE IF NOT EXISTS receipt_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                receipt_id INTEGER NOT NULL,
                ticket_id INTEGER NOT NULL,
                price REAL NOT NULL,
                discount REAL DEFAULT 0,
                amount INTEGER DEFAULT 1,
                FOREIGN KEY (receipt_id) REFERENCES receipts(id),
                FOREIGN KEY (ticket_id) REFERENCES tickets(id)
            );
        `);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_receipt_items_receipt ON receipt_items(receipt_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_receipt_items_tickets ON receipt_items(ticket_id);`);

        return "Database initialized successfully";
    } catch (err) {
        console.error('Error initializing database:', err.message);
        throw err;
    }
}

module.exports = {
    database
};

// Run the initialization if this file is run directly
if (require.main === module) {
    database().then(console.log).catch(console.error);
}
