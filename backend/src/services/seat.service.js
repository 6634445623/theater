const db = require("../models/db.model")
const helper= require("../utils/helper.util")

async function get(schedule_id) {
    seat = await db.query(`
        SELECT 
            z.name AS zone_name,
            s.id AS seat_id,
            s.is_spacer,
            s.row,
            s.column,
            CASE
                WHEN s.is_reserve = 0 AND t.id IS NULL THEN 1
                ELSE 0
            END AS available
        FROM seat s
        JOIN zone z ON s.zone_id = z.id
        LEFT JOIN ticket t 
            ON t.seat_id = s.id AND t.schedule_id = ?
        ORDER BY 
            z.name ASC,
            s.row ASC,
            s.column ASC;
    `, [schedule_id])


    return helper.emptyOrRows(helper.formatSeats(seat))
}

async function valid(seat_id, schedule_id) {
    seat = await db.query(`
        SELECT 
            CASE
                WHEN s.is_reserve = 0 AND t.id IS NULL THEN 1
                ELSE 0
            END AS available
        FROM seat s
        LEFT JOIN ticket t ON t.seat_id = ? AND t.schedule_id = ?
    `, [seat_id, schedule_id])


    return helper.emptyOrRows(seat)[0]
}

async function getTempTicket(user_id, schedule_id) {
    tickets = await db.query("SELECT t.id as ticketId, t.seat_id as seatId, s.row as `row` FROM ticket t LEFT JOIN seat s ON t.seat_id = s.id WHERE t.user_id = ? AND t.schedule_id = ? AND t.confirmed != 1", [user_id, schedule_id])
    return(helper.emptyOrRows(tickets))
}

async function selectSeat(user_id, seat_id, schedule_id){
    ticket = await db.query("SELECT id FROM ticket WHERE user_id = ? AND seat_id = ? AND schedule_id = ?", [user_id, seat_id, schedule_id])
    if (helper.emptyOrRows(ticket).length > 0) {
        return {ticketId: ticket[0].id}
    }

    valid(seat_id, schedule_id).then((result) => {
        if (result.available == 0) {
            return "Seat is not available"
        }
    })

    result = await db.query("INSERT INTO ticket (user_id, seat_id, schedule_id) VALUES (?, ?, ?)", [user_id, seat_id, schedule_id])
    return {ticketId: result.lastInsertRowid}
}

async function unSelectSeat(user_id, ticket_id){
    await db.query("DELETE FROM ticket WHERE id = ? AND user_id = ? AND confirmed = 0", [ticket_id, user_id])
    return "Success"
}

async function book(user_id, ticket_ids){
    result = await db.query("INSERT INTO reciept (payment_method, `date`, user_id) VALUES (?, CURRENT_DATE, ?)", ["CASH", user_id])


    ticket_ids.map(async (id) => {
        await db.query("INSERT INTO reciept_item (price, discount, amount, reciept_id, ticket_id) VALUES (120, 10, 1, ?, ?)", [result.lastInsertRowid, id])
    })

    palceholder = ticket_ids.map(() => '?').join(', ')
    
    await db.query(`UPDATE ticket SET confirmed = 1 WHERE user_id = ? AND confirmed = 0 AND id in (${palceholder})`, [user_id, ...ticket_ids])
    return "Success"
}

module.exports = {
    get,
    valid,
    selectSeat,
    unSelectSeat,
    getTempTicket,
    book
}