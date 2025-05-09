const db = require("../models/db.model");

async function database() {
    try {
        // Enable foreign key support
        await db.query('PRAGMA foreign_keys = ON;');

        // Users table - no dependencies
        await db.query(`
            CREATE TABLE IF NOT EXISTS user (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL
            );
        `);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_user_username ON user(username);`);

        // Theatre table - no dependencies
        await db.query(`
            CREATE TABLE IF NOT EXISTS theatre (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL
            );
        `);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_theatre_name ON theatre(name);`);

        // Movie table - no dependencies
        await db.query(`
            CREATE TABLE IF NOT EXISTS movie (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                poster TEXT NOT NULL,
                description TEXT,
                duration INTEGER NOT NULL
            );
        `);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_movie_name ON movie(name);`);

        // Zone table - depends on theatre
        await db.query(`
            CREATE TABLE IF NOT EXISTS zone (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                theatre_id INTEGER NOT NULL,
                FOREIGN KEY (theatre_id) REFERENCES theatre(id)
            );
        `);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_zone_theatre ON zone(theatre_id);`);

        // Schedule table - depends on movie and theatre
        await db.query(`
            CREATE TABLE IF NOT EXISTS schedule (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                movie_id INTEGER NOT NULL,
                theatre_id INTEGER NOT NULL,
                date TEXT NOT NULL,
                start_time TEXT NOT NULL,
                FOREIGN KEY (movie_id) REFERENCES movie(id),
                FOREIGN KEY (theatre_id) REFERENCES theatre(id)
            );
        `);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_schedule_movie ON schedule(movie_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_schedule_theatre ON schedule(theatre_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_schedule_date ON schedule(date);`);

        // Seat table - depends on zone
        await db.query(`
            CREATE TABLE IF NOT EXISTS seat (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                row INTEGER NOT NULL,
                column INTEGER NOT NULL,
                zone_id INTEGER NOT NULL,
                theatre_id INTEGER NOT NULL,
                is_reserve INTEGER DEFAULT 0,
                is_spacer INTEGER DEFAULT 0,
                FOREIGN KEY (zone_id) REFERENCES zone(id),
                FOREIGN KEY (theatre_id) REFERENCES theatre(id)
            );
        `);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_seat_zone ON seat(zone_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_seat_theatre ON seat(theatre_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_seat_location ON seat(row, column);`);

        // Ticket table - depends on user, seat, and schedule
        await db.query(`
            CREATE TABLE IF NOT EXISTS ticket (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                seat_id INTEGER NOT NULL,
                schedule_id INTEGER NOT NULL,
                status TEXT CHECK(status IN ('available', 'selected', 'booked')) DEFAULT 'available',
                confirmed INTEGER DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES user(id),
                FOREIGN KEY (seat_id) REFERENCES seat(id),
                FOREIGN KEY (schedule_id) REFERENCES schedule(id)
            );
        `);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_ticket_user ON ticket(user_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_ticket_seat ON ticket(seat_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_ticket_schedule ON ticket(schedule_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_ticket_status ON ticket(status);`);

        // Receipt table - depends on user
        await db.query(`
            CREATE TABLE IF NOT EXISTS receipt (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                date DATETIME DEFAULT CURRENT_TIMESTAMP,
                payment_method TEXT NOT NULL CHECK(payment_method IN ('CASH', 'CARD')),
                FOREIGN KEY (user_id) REFERENCES user(id)
            );
        `);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_receipt_user ON receipt(user_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_receipt_date ON receipt(date);`);

        // Receipt items table - depends on receipt and ticket
        await db.query(`
            CREATE TABLE IF NOT EXISTS receipt_item (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                receipt_id INTEGER NOT NULL,
                ticket_id INTEGER NOT NULL,
                price REAL NOT NULL,
                discount REAL DEFAULT 0,
                amount INTEGER DEFAULT 1,
                FOREIGN KEY (receipt_id) REFERENCES receipt(id),
                FOREIGN KEY (ticket_id) REFERENCES ticket(id)
            );
        `);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_receipt_item_receipt ON receipt_item(receipt_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_receipt_item_ticket ON receipt_item(ticket_id);`);

        return "Database initialized successfully";
    } catch (err) {
        console.error('Error initializing database:', err.message);
        throw err;
    }
}

module.exports = {
    database
};
