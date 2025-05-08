const seat = require('../services/seat.service')

async function get(req, res, next) {
    try {
        res.json(await seat.get(require('url').parse(req.url,true).query.scheduleId))
    } catch (err) {
        console.error(`Error while getting list of seat`, err.message);
        next(err);
    }
}

async function valid(req, res, next) {
    try {
        const { seatId, scheduleId } = require('url').parse(req.url,true).query
        res.json(await seat.valid(seatId, scheduleId))
    } catch (err) {
        console.error(`Error while validating seat`, err.message);
        next(err);
    }
}

async function selectSeat(req, res, next) {
    try {
        res.json(await seat.selectSeat(req.user.id, req.body.seatId, req.body.scheduleId))
    } catch (err) {
        console.error(`Error while selecting seat`, err.message);
        next(err);
    }
}

async function unSelectSeat(req, res, next) {
    try {
        res.json(await seat.unSelectSeat(req.user.id, req.body.ticketId))
    } catch (err) {
        console.error(`Error while unselecting seat`, err.message);
        next(err);
    }
}

async function getTempTicket(req, res, next) {
    try {
        const { scheduleId } = require('url').parse(req.url,true).query
        res.json(await seat.getTempTicket(req.user.id, scheduleId))
    } catch (err) {
        console.error(`Error while getting temp ticket`, err.message);
        next(err);
    }
}

async function book(req, res, next) {
    try {
        res.json(await seat.book(req.user.id, req.body.ticketIds))
    } catch (err) {
        console.error(`Error while booking`, err.message);
        next(err);
    }
}

module.exports = {
    get,
    valid,
    selectSeat,
    unSelectSeat,
    getTempTicket,
    book
}