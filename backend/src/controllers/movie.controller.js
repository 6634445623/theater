const movieService = require("../services/movie.service")
const { requireAdmin } = require("../middlewares/auth.middleware")

async function getMultiple(req, res, next) {
    try {
        const movies = await movieService.getMultiple()
        res.json(movies)
    } catch (err) {
        console.error(`Error while getting movies`, err.message)
        next(err)
    }
}

async function getById(req, res, next) {
    try {
        const id = parseInt(req.params.movieId)
        const movie = await movieService.getById(id)
        if (!movie) {
            res.status(404).json({ message: 'Movie not found' })
            return
        }
        res.json(movie)
    } catch (err) {
        console.error(`Error while getting movie by id`, err.message)
        next(err)
    }
}

async function create(req, res, next) {
    try {
        await requireAdmin(req, res);
        const movieData = {
            name: req.body.name,
            poster: req.body.poster,
            description: req.body.description,
            duration: req.body.duration,
            rating: req.body.rating,
            release_date: req.body.release_date
        }
        const result = await movieService.create(movieData)
        res.json(result)
    } catch (err) {
        console.error(`Error while creating movie`, err.message)
        next(err)
    }
}

async function update(req, res, next) {
    try {
        await requireAdmin(req, res);
        const id = parseInt(req.params.movieId)
        const movieData = {
            name: req.body.name,
            poster: req.body.poster,
            description: req.body.description,
            duration: req.body.duration,
            rating: req.body.rating,
            release_date: req.body.release_date
        }
        const result = await movieService.update(id, movieData)
        res.json(result)
    } catch (err) {
        console.error(`Error while updating movie`, err.message)
        next(err)
    }
}

async function remove(req, res, next) {
    try {
        await requireAdmin(req, res);
        const id = parseInt(req.params.movieId)
        const result = await movieService.remove(id)
        res.json(result)
    } catch (err) {
        console.error(`Error while deleting movie`, err.message)
        next(err)
    }
}

module.exports = {
    getMultiple,
    getById,
    create,
    update,
    remove
}