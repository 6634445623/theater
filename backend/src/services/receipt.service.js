const db = require("../models/db.model")
const helper = require("../utils/helper.util")

async function gets(user_id) {
    const receipts = await db.query(`
        SELECT
            r.id AS receiptId,
            m.name AS movie_name,
            m.poster AS movie_poster,
            r.date AS date
        FROM receipt r
        LEFT JOIN receipt_item ri ON r.id = ri.receipt_id
        LEFT JOIN ticket t ON ri.ticket_id = t.id
        LEFT JOIN schedule s ON t.schedule_id = s.id
        LEFT JOIN movie m ON s.movie_id = m.id
        WHERE r.user_id = ?
        ORDER BY r.date DESC
    `, [user_id])

    return helper.emptyOrRows(receipts)
}

async function get(receipt_id) {
    const head = await db.query(`
        SELECT
            r.id AS receiptId,
            m.name AS movie_name,
            m.poster AS movie_poster,
            r.date AS date
        FROM receipt r
        LEFT JOIN receipt_item ri ON r.id = ri.receipt_id
        LEFT JOIN ticket t ON ri.ticket_id = t.id
        LEFT JOIN schedule s ON t.schedule_id = s.id
        LEFT JOIN movie m ON s.movie_id = m.id
        WHERE r.id = ?
    `, [receipt_id])

    const body = await db.query(`
        SELECT
            t.id AS ticketId,
            s.row AS row,
            s.column AS column,
            z.name AS zone,
            ri.price AS price,
            ri.discount AS discount,
            ri.amount AS amount
        FROM receipt r
        LEFT JOIN receipt_item ri ON r.id = ri.receipt_id
        LEFT JOIN ticket t ON ri.ticket_id = t.id
        LEFT JOIN seat s ON t.seat_id = s.id
        LEFT JOIN zone z ON s.zone_id = z.id
        WHERE r.id = ?
    `, [receipt_id])

    return { header: helper.emptyOrRows(head), items: helper.emptyOrRows(body) }
}

module.exports = {
    gets,
    get
}


