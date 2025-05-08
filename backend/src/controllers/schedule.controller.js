const schedule = require("../services/schedule.service")

async function get(req, res, next) {
    try {
        res.json(await schedule.get(require('url').parse(req.url,true).query.movieId))
    } catch (err) {
        console.error(`Error while getting list of schedule`, err.message);
        next(err);
    }
}

module.exports = {
    get,
}