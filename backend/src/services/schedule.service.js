const db = require("../models/db.model")
const helper= require("../utils/helper.util")

async function get(movie_id) {
    movieInfo = await db.query(`
        SELECT 
            name, 
            poster, 
            duration
        FROM 
            movie
        WHERE 
            id = ?;
    `, [movie_id])

    schedu = await db.query(`
        SELECT 
            s.id,
            s.date,
            t.name AS theatre_name,
            s.start_time,
            CASE
                WHEN datetime(s.date || ' ' || s.start_time) > datetime('now', '-30 minutes') THEN 1
                ELSE 0
            END AS available
        FROM schedule s
        JOIN theatre t ON s.theatre_id = t.id
        WHERE 
            s.movie_id = ? AND
            date(s.date) >= date('now')
        ORDER BY 
            s.date ASC,
            t.name ASC,
            s.start_time ASC;
    `, [movie_id])


    return {
        movieInfo: helper.emptyOrRows(movieInfo),
        schedule: helper.formatSchedule(helper.emptyOrRows(schedu))
    }
}

module.exports = {
    get,
}