const db = require("../models/db.model");

const mockMovies = [
    {
        name: "The Matrix Resurrections",
        poster: "https://image.tmdb.org/t/p/w500/8c4a8kE7PizaGQQnditMmI1xbRp.jpg",
        description: "Return to a world of two realities: one, everyday life; the other, what lies behind it. To find out if his reality is a construct, to truly know himself, Mr. Anderson will have to choose to follow the white rabbit once more.",
        duration: 148
    },
    {
        name: "Dune",
        poster: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
        description: "Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people.",
        duration: 155
    },
    {
        name: "Spider-Man: Across the Spider-Verse",
        poster: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
        description: "Miles Morales returns for the next chapter of the Spider-Verse saga, an epic adventure that will transport Brooklyn's full-time, friendly neighborhood Spider-Man across the Multiverse.",
        duration: 140
    },
    {
        name: "Inception",
        poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
        description: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: inception.",
        duration: 148
    },
    {
        name: "The Grand Budapest Hotel",
        poster: "https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg",
        description: "The adventures of Gustave H, a legendary concierge at a famous hotel, and Zero Moustafa, the lobby boy who becomes his most trusted friend.",
        duration: 99
    }
];

const mockTheatres = [
    { name: "Grand Theatre" },
    { name: "Cinema Paradise" },
    { name: "Royal Cinema" }
];

const mockZones = [
    { name: "VIP", theatre_id: 1 },
    { name: "Regular", theatre_id: 1 },
    { name: "Premium", theatre_id: 2 },
    { name: "Standard", theatre_id: 2 },
    { name: "Deluxe", theatre_id: 3 },
    { name: "Normal", theatre_id: 3 }
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
    const times = ['10:00', '13:00', '16:00', '19:00', '22:00'];
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        for (const time of times) {
            await db.query(
                "INSERT INTO schedule (movie_id, theatre_id, date, start_time) VALUES (?, ?, ?, ?)",
                [movieId, theatreId, dateStr, time]
            );
        }
    }
}

async function insertMockData() {
    try {
        // Insert theatres
        for (const theatre of mockTheatres) {
            const result = await db.query(
                "INSERT INTO theatre (name) VALUES (?)",
                [theatre.name]
            );
        }

        // Insert zones
        for (const zone of mockZones) {
            const result = await db.query(
                "INSERT INTO zone (name, theatre_id) VALUES (?, ?)",
                [zone.name, zone.theatre_id]
            );
            // Generate seats for each zone
            await generateSeats(result.lastInsertRowid, zone.theatre_id, 8, 10); // 8 rows, 10 seats per row
        }

        // Insert movies
        for (const movie of mockMovies) {
            const result = await db.query(
                "INSERT INTO movie (name, poster, description, duration) VALUES (?, ?, ?, ?)",
                [movie.name, movie.poster, movie.description, movie.duration]
            );
            
            // Generate schedules for each theatre for this movie
            for (let theatreId = 1; theatreId <= mockTheatres.length; theatreId++) {
                await generateSchedules(result.lastInsertRowid, theatreId);
            }
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
