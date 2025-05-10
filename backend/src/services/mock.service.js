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
    },
    {
        name: "Spider-Man: No Way Home",
        poster: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
        description: "Peter Parker’s life and reputation are turned upside down when his identity is revealed. He seeks help from Doctor Strange to restore his secret, but things get far more dangerous.",
        duration: 148,
        rating: 4.6,
        release_date: "2024-04-15"
    },
    {
        name: "Avatar: The Way of Water",
        poster: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
        description: "Jake Sully lives with his newfound family formed on the planet of Pandora. But when a familiar threat returns, Jake must work with Neytiri and the army of the Na'vi to protect their home.",
        duration: 192,
        rating: 4.5,
        release_date: "2024-03-20"
    },
    {
        name: "The Batman",
        poster: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
        description: "Batman ventures into Gotham City's underworld when a sadistic killer leaves behind a trail of cryptic clues. As the evidence begins to lead closer to home, he must forge new relationships to unmask the culprit.",
        duration: 176,
        rating: 4.4,
        release_date: "2024-02-10"
    },
    {
        name: "Mission: Impossible – Dead Reckoning Part One",
        poster: "https://image.tmdb.org/t/p/w500/NNxYkU70HPurnNCSiCjYAmacwm.jpg",
        description: "Ethan Hunt and his IMF team embark on their most dangerous mission yet: to track down a terrifying new weapon that threatens all of humanity.",
        duration: 163,
        rating: 4.3,
        release_date: "2024-04-25"
    },
    {
        name: "John Wick: Chapter 4",
        poster: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
        description: "With the price on his head ever increasing, John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, he must face off against a new enemy.",
        duration: 169,
        rating: 4.6,
        release_date: "2024-03-10"
    },
    {
        name: "Guardians of the Galaxy Vol. 3",
        poster: "https://image.tmdb.org/t/p/w500/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg",
        description: "Still reeling from the loss of Gamora, Peter Quill rallies his team to defend the universe and one of their own. A mission that could mean the end of the Guardians if not successful.",
        duration: 150,
        rating: 4.5,
        release_date: "2024-05-05"
    }
];

const mockTheatres = [
    { name: "Minor Cineplex" }
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
    for (let i = 0; i < 4; i++) {
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
