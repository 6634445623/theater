const movie = require("../services/movie.service")

async function getMultiple(req, res, next) {
    try {
        res.json(await movie.getMultiple())
    } catch (err) {
        console.error(`Error while getting list of movie`, err.message);
        next(err);
    }
}

module.exports = {
    getMultiple,
}