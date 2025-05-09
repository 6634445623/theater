const db = require("../models/db.model")
const helper= require("../utils/helper.util")

async function get(movie_id) {
    const movieInfo = await db.query(`
        SELECT 
            name, 
            poster, 
            duration
        FROM 
            movies
        WHERE 
            id = ?;
    `, [movie_id])

    if (!helper.emptyOrRows(movieInfo)[0]) {
        const error = new Error('Movie not found')
        error.statusCode = 404
        throw error
    }    const schedules = await db.query(`
        SELECT 
            s.id,
            s.date,
            t.name as theatre_name,
            s.start_time,
            COUNT(DISTINCT CASE 
                WHEN ti.id IS NULL OR ti.status = 'available' THEN se.id
            END) as available
        FROM schedules s
        JOIN theatres t ON s.theatre_id = t.id
        JOIN zones z ON z.theatre_id = t.id
        JOIN seats se ON se.zone_id = z.id
        LEFT JOIN tickets ti ON ti.seat_id = se.id AND ti.schedule_id = s.id
        WHERE s.movie_id = ? AND
            (date(s.date) > date('now') OR 
            (date(s.date) = date('now') AND datetime(s.start_time) > datetime('now', '-30 minutes')))
        ORDER BY 
            s.date, s.start_time;
    `, [movie_id, movie_id])

    return {
        movie: helper.emptyOrRows(movieInfo)[0],
        schedules: helper.formatSchedule(helper.emptyOrRows(schedules))
    }
}

module.exports = {
    get,
}