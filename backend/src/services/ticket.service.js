const db = require("../models/db.model")
const helper= require("../utils/helper.util")
const QRCode = require('qrcode');

async function gets(user_id) {
    tickets = await db.query(`
        SELECT
            t.id AS ticketId,
            m.name AS movie_name,
            m.poster AS movie_poster,
            s.row AS row,
            s.column AS column,
            z.name AS zone
        FROM ticket t
        LEFT JOIN schedule sc ON t.schedule_id = sc.id
        LEFT JOIN movie m ON sc.movie_id = m.id
        LEFT JOIN seat s ON t.seat_id = s.id
        LEFT JOIN zone z ON s.zone_id = z.id
        WHERE t.user_id = ?
        ORDER BY t.id DESC
    `, [user_id])


    return helper.emptyOrRows(tickets)
}

async function get(ticket_id) {
    info = await db.query(`
        SELECT
            t.id AS ticketId,
            m.name AS movie_name,
            m.poster AS movie_poster,
            s.row AS row,
            s.column AS column,
            z.name AS zone
        FROM ticket t
        LEFT JOIN schedule sc ON t.schedule_id = sc.id
        LEFT JOIN movie m ON sc.movie_id = m.id
        LEFT JOIN seat s ON t.seat_id = s.id
        LEFT JOIN zone z ON s.zone_id = z.id
        WHERE t.id = ?
    `, [ticket_id])
    return { info: helper.emptyOrRows(info), qr: await QRCode.toDataURL(ticket_id) }
}

module.exports = {
    gets,
    get
}


             