const schedule = require("../services/schedule.service")

async function get(req, res, next) {
    try {
        res.json(await schedule.get(require('url').parse(req.url,true).query.movieId))
    } catch (err) {
        console.error(`Error while getting list of schedule`, err.message);
        next(err);
    }
}

async function getById(req, res, next) {
  try {
    const scheduleId = parseInt(req.params.id, 10)
    res.json(await schedule.getById(scheduleId))
  } catch (err) {
    console.error(`Error while getting schedule ${req.params.id}`, err.message)
    next(err)
  }
}

module.exports = {
    get,
    getById,
}