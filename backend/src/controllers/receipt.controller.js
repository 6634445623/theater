const receipt = require('../services/receipt.service')

async function gets(req, res, next) {
    try {
        res.json(await receipt.gets(req.user.id))
    } catch (err) {
        console.error(`Error while getting list of receipts`, err.message);
        next(err);
    }
}

async function get(req, res, next) {
    try {
        res.json(await receipt.get(require('url').parse(req.url,true).query.receiptId))
    } catch (err) {
        console.error(`Error while getting receipt`, err.message);
        next(err);
    }
}

module.exports = {
    gets,
    get
}