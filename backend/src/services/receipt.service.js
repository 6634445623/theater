const db = require("../models/db.model")
const helper = require("../utils/helper.util")

async function gets(user_id) {
    const rows = await db.query(
        `SELECT r.id, r.payment_method, r.date, m.name as movie_name, m.poster as movie_poster
        FROM receipts r
        JOIN schedules sc ON r.schedule_id = sc.id
        JOIN movies m ON sc.movie_id = m.id
        WHERE r.user_id = ?
        ORDER BY r.date DESC`,
        [user_id]
    );

    return helper.emptyOrRows(rows)
}

async function get(receipt_id) {
    const rows = await db.query(
        `SELECT r.id, r.payment_method, r.date, m.name as movie_name, m.poster as movie_poster
        FROM receipts r
        JOIN schedules sc ON r.schedule_id = sc.id
        JOIN movies m ON sc.movie_id = m.id
        WHERE r.id = ?`,
        [receipt_id]
    );

    const body = await db.query(`
        SELECT
            t.id AS ticketId,
            s.row AS row,
            s.column AS column,
            z.name AS zone,
            ri.price AS price,
            ri.discount AS discount,
            ri.amount AS amount
        FROM receipts r
        LEFT JOIN receipt_items ri ON r.id = ri.receipt_id
        LEFT JOIN tickets t ON ri.ticket_id = t.id
        LEFT JOIN seats s ON t.seat_id = s.id
        LEFT JOIN zones z ON s.zone_id = z.id
        WHERE r.id = ?
    `, [receipt_id])

    return { header: helper.emptyOrRows(rows), items: helper.emptyOrRows(body) }
}

module.exports = {
    gets,
    get
}


