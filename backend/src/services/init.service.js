const db = require("../models/db.model");

async function database() {
    try {
        // Users table
        await db.query(`
            CREATE TABLE IF NOT EXISTS user (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL
            );
        `);

        // Theatre table
        await db.query(`
            CREATE TABLE IF NOT EXISTS theatre (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL
            );
        `);

        // Zone table
        await db.query(`
            CREATE TABLE IF NOT EXISTS zone (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                theatre_id INTEGER,
                FOREIGN KEY (theatre_id) REFERENCES theatre(id)
            );
        `);

        // Movie table
        await db.query(`
            CREATE TABLE IF NOT EXISTS movie (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                poster TEXT NOT NULL,
                description TEXT,
                duration INTEGER NOT NULL
            );
        `);

        // Schedule table
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

        // Seat table
        await db.query(`
            CREATE TABLE IF NOT EXISTS seat (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                row INTEGER NOT NULL,
                column INTEGER NOT NULL,
                zone_id INTEGER NOT NULL,
                theatre_id INTEGER NOT NULL,
                FOREIGN KEY (zone_id) REFERENCES zone(id),
                FOREIGN KEY (theatre_id) REFERENCES theatre(id)
            );
        `);

        // Ticket table
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

        // Receipt table
        await db.query(`
            CREATE TABLE IF NOT EXISTS receipt (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                date DATETIME DEFAULT CURRENT_TIMESTAMP,
                payment_method TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES user(id)
            );
        `);

        // Receipt items table
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

    } catch (err) {
        console.error('Error initializing database:', err.message);
        throw err;
    }
}

module.exports = {
    database
};
