const movie = require("../services/movie.service")
const { requireAdmin } = require("../middlewares/auth.middleware")

async function getMultiple(req, res, next) {
    try {
        const movies = await movie.getMultiple()
        res.json(movies)
    } catch (err) {
        console.error(`Error while getting movies`, err.message)
        next(err)
    }
}

async function getById(req, res, next) {
    try {
        const id = parseInt(req.params.movieId)
        res.json(await movie.getById(id))
    } catch (err) {
        console.error(`Error while getting movie by id`, err.message)
        next(err)
    }
}

async function create(req, res, next) {
    try {
        requireAdmin(req, res, () => {
            const movieData = {
                name: req.body.name,
                poster: req.body.poster,
                description: req.body.description,
                duration: req.body.duration,
                rating: req.body.rating,
                release_date: req.body.release_date
            }
            const result = movie.create(movieData)
            res.json(result)
        })
    } catch (err) {
        console.error(`Error while creating movie`, err.message)
        next(err)
    }
}

async function update(req, res, next) {
    try {
        requireAdmin(req, res, () => {
            const id = req.params.id
            const movieData = {
                name: req.body.name,
                poster: req.body.poster,
                description: req.body.description,
                duration: req.body.duration,
                rating: req.body.rating,
                release_date: req.body.release_date
            }
            const result = movie.update(id, movieData)
            res.json(result)
        })
    } catch (err) {
        console.error(`Error while updating movie`, err.message)
        next(err)
    }
}

async function remove(req, res, next) {
    try {
        requireAdmin(req, res, () => {
            const id = req.params.id
            const result = movie.remove(id)
            res.json(result)
        })
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