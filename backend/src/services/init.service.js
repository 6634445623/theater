const db = require("../models/db.model");

async function database() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS user (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                password TEXT NOT NULL
            );
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS theatre (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL
            );
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS zone (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                theatre_id INTEGER NOT NULL,
                FOREIGN KEY (theatre_id) REFERENCES theatre(id) ON DELETE CASCADE
            );
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS seat (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                row INTEGER NOT NULL,
                column INTEGER NOT NULL,
                is_spacer INTEGER NOT NULL DEFAULT 0,
                color TEXT NOT NULL,
                is_reserve INTEGER NOT NULL DEFAULT 0,
                zone_id INTEGER NOT NULL,
                FOREIGN KEY (zone_id) REFERENCES zone(id) ON DELETE CASCADE
            );
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS movie (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                duration INTEGER NOT NULL,
                poster TEXT NOT NULL,
                rating REAL NOT NULL,
                release_date TEXT NOT NULL
            );
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS schedule (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                start_time TEXT NOT NULL,
                end_time TEXT NOT NULL,
                date TEXT NOT NULL,
                theatre_id INTEGER NOT NULL,
                movie_id INTEGER NOT NULL,
                FOREIGN KEY (theatre_id) REFERENCES theatre(id) ON DELETE CASCADE,
                FOREIGN KEY (movie_id) REFERENCES movie(id) ON DELETE CASCADE
            );
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS ticket (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                seat_id INTEGER NOT NULL,
                schedule_id INTEGER NOT NULL,
                confirmed INTEGER NOT NULL DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
                FOREIGN KEY (seat_id) REFERENCES seat(id) ON DELETE CASCADE,
                FOREIGN KEY (schedule_id) REFERENCES schedule(id) ON DELETE CASCADE
            );
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS reciept (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                payment_method TEXT NOT NULL CHECK (payment_method IN ('CASH', 'CARD')),
                date TEXT DEFAULT CURRENT_TIMESTAMP,
                user_id INTEGER NOT NULL,
                FOREIGN KEY (user_id) REFERENCES user(id)
            );
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS reciept_item (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                price REAL NOT NULL,
                discount REAL NOT NULL,
                amount INTEGER NOT NULL,
                reciept_id INTEGER NOT NULL,
                ticket_id INTEGER NOT NULL,
                FOREIGN KEY (reciept_id) REFERENCES reciept(id),
                FOREIGN KEY (ticket_id) REFERENCES ticket(id)
            );
        `);

        return "Database initialization complete.";
    } catch (err) {
        throw new Error("Failed to initialize database: " + err.message);
    }
}

module.exports = {
    database
};
