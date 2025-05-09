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
    { 
        name: "Regular", 
        theatre_id: 1,
        price: 120,
        description: "Standard seating with good view"
    },
    { 
        name: "Premium", 
        theatre_id: 1,
        price: 180,
        description: "Premium seating with extra legroom"
    },
    { 
        name: "VIP", 
        theatre_id: 1,
        price: 250,
        description: "VIP seating with exclusive amenities"
    }
];

async function generateSeats(zoneId, theatreId, rows, seatsPerRow) {
    for (let row = 1; row <= rows; row++) {
        for (let col = 1; col <= seatsPerRow; col++) {
            await db.query(
                "INSERT INTO seats (row, column, zone_id, theatre_id) VALUES (?, ?, ?, ?)",
                [row, col, zoneId, theatreId]
            );
        }
    }
}

async function generateSchedules(movieId, theatreId) {
    const dates = ['2024-05-01', '2024-05-02', '2024-05-03'];
    const times = ['10:00', '13:00', '16:00', '19:00', '22:00'];

    for (const date of dates) {
        for (const time of times) {
            await db.query(
                "INSERT INTO schedules (movie_id, theatre_id, date, start_time) VALUES (?, ?, ?, ?)",
                [movieId, theatreId, date, time]
            );
        }
    }
}

async function insertMockData() {
    try {
        // Clear existing data
        await db.query('DELETE FROM booking_seats');
        await db.query('DELETE FROM bookings');
        await db.query('DELETE FROM schedules');
        await db.query('DELETE FROM seats');
        await db.query('DELETE FROM zones');
        await db.query('DELETE FROM theatres');
        await db.query('DELETE FROM movies');

        // Insert theatres
        const theatreResult = await db.query(
            "INSERT INTO theatres (name) VALUES (?)",
            [mockTheatres[0].name]
        );

        // Insert zones and store their IDs
        const zoneIds = [];
        for (const zone of mockZones) {
            const zoneResult = await db.query(
                "INSERT INTO zones (name, theatre_id, price, description) VALUES (?, ?, ?, ?)",
                [zone.name, theatreResult.lastInsertRowid, zone.price, zone.description]
            );
            zoneIds.push(zoneResult.lastInsertRowid);
        }

        // Generate seats for each zone
        // Regular zone: 5 rows, 8 seats per row
        await generateSeats(zoneIds[0], theatreResult.lastInsertRowid, 5, 8);
        
        // Premium zone: 3 rows, 6 seats per row
        await generateSeats(zoneIds[1], theatreResult.lastInsertRowid, 3, 6);
        
        // VIP zone: 2 rows, 4 seats per row
        await generateSeats(zoneIds[2], theatreResult.lastInsertRowid, 2, 4);

        // Insert movies
        for (const movie of mockMovies) {
            const movieResult = await db.query(
                "INSERT INTO movies (name, poster, description, duration, rating, release_date) VALUES (?, ?, ?, ?, ?, ?)",
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
