const db = require("../models/db.model")
const helper= require("../utils/helper.util")

async function getMultiple() {
    const rows = await db.query(
        `SELECT * FROM movies ORDER BY name`
    )
    return helper.emptyOrRows(rows)
}

async function getById(id) {
    const row = await db.query(
        `SELECT * FROM movies WHERE id = ? LIMIT 1`,
        [id]
    )
    const result = helper.emptyOrRows(row)
    if (!result || Object.keys(result).length === 0) {
        return null
    }
    return result
}

async function create(movieData) {
    const result = await db.query(
        `INSERT INTO movies (name, poster, description, duration, rating, release_date) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [movieData.name, movieData.poster, movieData.description, movieData.duration, movieData.rating, movieData.release_date]
    )
    return { id: result.lastInsertRowid, ...movieData }
}

async function update(id, movieData) {
    const result = await db.query(
        `UPDATE movies 
         SET name = ?, poster = ?, description = ?, duration = ?, rating = ?, release_date = ?
         WHERE id = ?`,
        [movieData.name, movieData.poster, movieData.description, movieData.duration, movieData.rating, movieData.release_date, id]
    )
    return { id, ...movieData }
}

async function remove(id) {
    const result = await db.query(
        `DELETE FROM movies WHERE id = ?`,
        [id]
    )
    return { id }
}

module.exports = {
    getMultiple,
    getById,
    create,
    update,
    remove
}