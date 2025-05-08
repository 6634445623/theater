const ticket = require('../services/ticket.service')

async function gets(req, res, next) {
    try {
        res.json(await ticket.gets(req.user.id))
    } catch (err) {
        console.error(`Error while getting list of reciept`, err.message);
        next(err);
    }
}

async function get(req, res, next) {
    try {
        res.json(await ticket.get(require('url').parse(req.url,true).query.ticketId))
    } catch (err) {
        console.error(`Error while getting list of reciept`, err.message);
        next(err);
    }
}

module.exports = {
    gets,
    get
}