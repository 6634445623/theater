const reciept = require('../services/reciept.service')

async function gets(req, res, next) {
    try {
        res.json(await reciept.gets(req.user.id))
    } catch (err) {
        console.error(`Error while getting list of reciept`, err.message);
        next(err);
    }
}

async function get(req, res, next) {
    try {
        res.json(await reciept.get(require('url').parse(req.url,true).query.recieptId))
    } catch (err) {
        console.error(`Error while getting list of reciept`, err.message);
        next(err);
    }
}

module.exports = {
    gets,
    get
}