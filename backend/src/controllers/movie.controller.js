const movie = require("../services/movie.service")

async function getMultiple(req, res, next) {
    try {
        res.json(await movie.getMultiple())
    } catch (err) {
        console.error(`Error while getting list of movie`, err.message);
        next(err);
    }
}

async function getById(req, res, next) {
    try {
        const id = parseInt(req.params.movieId)
        res.json(await movie.getById(id))
    } catch (err) {
        console.error(`Error while getting movie by id`, err.message);
        next(err);
    }
}

module.exports = {
    getMultiple,
    getById
}