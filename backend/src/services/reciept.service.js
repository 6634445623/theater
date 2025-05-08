const db = require("../models/db.model")
const helper= require("../utils/helper.util")

async function gets(user_id) {
    reciepts = await db.query(`
        SELECT
            r.id AS recieptId,
            m.name AS movie_name,
            m.poster AS movie_poster,
            r.date AS date
        FROM reciept r
        LEFT JOIN reciept_item ri ON r.id = ri.reciept_id
        LEFT JOIN ticket t ON ri.ticket_id = t.id
        LEFT JOIN schedule s ON t.schedule_id = s.id
        LEFT JOIN movie m ON s.movie_id = m.id
        WHERE r.user_id = ?
        ORDER BY r.date DESC
    `, [user_id])


    return helper.emptyOrRows(reciepts)
}

async function get(reciept_id) {
    head = await db.query(`
        SELECT
            r.id AS recieptId,
            m.name AS movie_name,
            m.poster AS movie_poster,
            r.date AS date
        FROM reciept r
        LEFT JOIN reciept_item ri ON r.id = ri.reciept_id
        LEFT JOIN ticket t ON ri.ticket_id = t.id
        LEFT JOIN schedule s ON t.schedule_id = s.id
        LEFT JOIN movie m ON s.movie_id = m.id
        WHERE r.id = ?
    `, [reciept_id])

    body = await db.query(`
        SELECT
            t.id AS ticketId,
            s.row AS row,
            s.column AS column,
            z.name AS zone,
            ri.price AS price,
            ri.discount AS discount,
            ri.amount AS amount
        FROM reciept r
        LEFT JOIN reciept_item ri ON r.id = ri.reciept_id
        LEFT JOIN ticket t ON ri.ticket_id = t.id
        LEFT JOIN seat s ON t.seat_id = s.id
        LEFT JOIN zone z ON s.zone_id = z.id
        WHERE r.id = ?
    `, [reciept_id])


    return { header: helper.emptyOrRows(head), items: helper.emptyOrRows(body) }
}

module.exports = {
    gets,
    get
}


             