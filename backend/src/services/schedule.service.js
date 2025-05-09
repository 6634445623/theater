const db = require("../models/db.model")
const helper= require("../utils/helper.util")

async function get(movie_id) {
    const movieInfo = await db.query(`
        SELECT 
            name, 
            poster, 
            duration
        FROM 
            movie
        WHERE 
            id = ?;
    `, [movie_id])

    if (!helper.emptyOrRows(movieInfo)[0]) {
        const error = new Error('Movie not found')
        error.statusCode = 404
        throw error
    }

    const schedules = await db.query(`
        SELECT 
            s.id,
            s.date,
            t.name as theatre_name,
            s.start_time,
            COUNT(CASE WHEN (ti.status = 'available' OR ti.status IS NULL) AND se.is_reserve = 0 THEN 1 END) as available
        FROM 
            schedule s
            JOIN theatre t ON s.theatre_id = t.id
            JOIN zone z ON z.theatre_id = t.id
            LEFT JOIN seat se ON se.zone_id = z.id
            LEFT JOIN ticket ti ON ti.seat_id = se.id AND ti.schedule_id = s.id
        WHERE 
            s.movie_id = ? AND
            (date(s.date) > date('now') OR 
            (date(s.date) = date('now') AND datetime(s.start_time) > datetime('now', '-30 minutes')))
        GROUP BY 
            s.id, s.date, t.name, s.start_time
        ORDER BY 
            s.date, s.start_time;
    `, [movie_id])

    return {
        movie: helper.emptyOrRows(movieInfo)[0],
        schedules: helper.formatSchedule(helper.emptyOrRows(schedules))
    }
}

module.exports = {
    get,
}