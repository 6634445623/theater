const db = require("../models/db.model");

const mockMovies = [
    {
        name: "The Matrix Resurrections",
        poster: "https://image.tmdb.org/t/p/w500/8c4a8kE7PizaGQQnditMmI1xbRp.jpg",
        description: "Return to a world of two realities: one, everyday life; the other, what lies behind it. To find out if his reality is a construct, to truly know himself, Mr. Anderson will have to choose to follow the white rabbit once more.",
        duration: 148,
        rating: 4.8,
        release_date: "2024-05-01"
    },
    {
        name: "Dune: Part Two",
        poster: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
        description: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.",
        duration: 166,
        rating: 4.9,
        release_date: "2024-05-01"
    },
    {
        name: "Oppenheimer",
        poster: "https://image.tmdb.org/t/p/w500/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
        description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
        duration: 180,
        rating: 4.7,
        release_date: "2024-05-01"
    }
];

const mockTheatres = [
    { name: "Main Hall" }
];

const mockZones = [
    { name: "Regular", theatre_id: 1 }
];

async function generateSeats(zoneId, theatreId, rows, columns) {
    for (let row = 1; row <= rows; row++) {
        for (let col = 1; col <= columns; col++) {
            await db.query(
                "INSERT INTO seat (row, column, zone_id, theatre_id, is_reserve, is_spacer) VALUES (?, ?, ?, ?, ?, ?)",
                [row, col, zoneId, theatreId, 0, 0]
            );
        }
    }
}

async function generateSchedules(movieId, theatreId, startDate = new Date()) {
    const times = ['14:00', '19:00'];
    
    // Generate schedules for today and tomorrow only
    for (let i = 0; i < 2; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        for (const time of times) {
            await db.query(
                "INSERT INTO schedule (movie_id, theatre_id, date, start_time, available) VALUES (?, ?, ?, ?, ?)",
                [movieId, theatreId, dateStr, time, 1]
            );
        }
    }
}

async function insertMockData() {
    try {
        // Clear existing data
        await db.query('DELETE FROM booking_seats');
        await db.query('DELETE FROM bookings');
        await db.query('DELETE FROM schedule');
        await db.query('DELETE FROM seat');
        await db.query('DELETE FROM zone');
        await db.query('DELETE FROM theatre');
        await db.query('DELETE FROM movie');

        // Insert theatre
        const theatreResult = await db.query(
            "INSERT INTO theatre (name) VALUES (?)",
            [mockTheatres[0].name]
        );

        // Insert zone
        const zoneResult = await db.query(
            "INSERT INTO zone (name, theatre_id) VALUES (?, ?)",
            [mockZones[0].name, theatreResult.lastInsertRowid]
        );

        // Generate minimal seat layout (3 rows, 5 seats per row)
        await generateSeats(zoneResult.lastInsertRowid, theatreResult.lastInsertRowid, 3, 5);

        // Insert movies
        for (const movie of mockMovies) {
            const movieResult = await db.query(
                "INSERT INTO movie (name, poster, description, duration, rating, release_date) VALUES (?, ?, ?, ?, ?, ?)",
                [
                    movie.name,
                    movie.poster,
                    movie.description,
                    movie.duration,
                    movie.rating,
                    movie.release_date
                ]
            );
            
            // Generate schedules for the movie
            await generateSchedules(movieResult.lastInsertRowid, theatreResult.lastInsertRowid);
        }

        return { message: "Mock data inserted successfully" };
    } catch (error) {
        console.error("Error inserting mock data:", error);
        throw error;
    }
}

module.exports = {
    insertMockData
};
