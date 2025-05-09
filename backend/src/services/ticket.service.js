const db = require("../models/db.model")
const helper= require("../utils/helper.util")
const QRCode = require('qrcode');

async function gets(user_id) {
    const rows = await db.query(
        `SELECT t.id as ticketId, m.name as movie_name, m.poster as movie_poster, s.row, s.column, z.name as zone, t.status, t.confirmed, t.schedule_id, t.seat_id, t.user_id
        FROM tickets t
        JOIN seats s ON t.seat_id = s.id
        JOIN zones z ON s.zone_id = z.id
        JOIN schedules sc ON t.schedule_id = sc.id
        JOIN movies m ON sc.movie_id = m.id
        WHERE t.user_id = ?
        ORDER BY t.created_at DESC`,
        [user_id]
    );

    return helper.emptyOrRows(rows)
}

async function get(ticket_id) {
    const rows = await db.query(
        `SELECT t.id as ticketId, m.name as movie_name, m.poster as movie_poster, s.row, s.column, z.name as zone, t.status, t.confirmed, t.schedule_id, t.seat_id, t.user_id
        FROM tickets t
        JOIN seats s ON t.seat_id = s.id
        JOIN zones z ON s.zone_id = z.id
        JOIN schedules sc ON t.schedule_id = sc.id
        JOIN movies m ON sc.movie_id = m.id
        WHERE t.id = ?`,
        [ticket_id]
    );
    return { info: helper.emptyOrRows(rows), qr: await QRCode.toDataURL(ticket_id) }
}

module.exports = {
    gets,
    get
}


             