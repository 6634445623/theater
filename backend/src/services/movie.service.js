const db = require("../models/db.model")
const helper= require("../utils/helper.util")

async function getMultiple() {
    const rows = await db.query(`SELECT DISTINCT m.*
        FROM movie m
        JOIN schedule s ON m.id = s.movie_id
        WHERE 
            date(s.date) > date('now') OR 
            (
                date(s.date) = date('now') AND 
                datetime(s.start_time) > datetime('now', '-30 minutes')
            );`)
    return helper.emptyOrRows(rows)
}

module.exports = {
    getMultiple,
}