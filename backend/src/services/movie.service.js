const db = require("../models/db.model")
const helper= require("../utils/helper.util")

async function getMultiple() {
    const rows = await db.query(
        `SELECT * FROM movie ORDER BY name`
    )
    return helper.emptyOrRows(rows)
}

async function getById(id) {
    const row = await db.query(
        `SELECT * FROM movie WHERE id = ? LIMIT 1`,
        [id]
    )
    return helper.emptyOrRows(row)
}

async function create(movieData) {
    const result = await db.query(
        `INSERT INTO movie (name, poster, description, duration, rating, release_date) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [movieData.name, movieData.poster, movieData.description, movieData.duration, movieData.rating, movieData.release_date]
    )
    return { id: result.lastInsertRowid, ...movieData }
}

async function update(id, movieData) {
    const result = await db.query(
        `UPDATE movie 
         SET name = ?, poster = ?, description = ?, duration = ?, rating = ?, release_date = ?
         WHERE id = ?`,
        [movieData.name, movieData.poster, movieData.description, movieData.duration, movieData.rating, movieData.release_date, id]
    )
    return { id, ...movieData }
}

async function remove(id) {
    const result = await db.query(
        `DELETE FROM movie WHERE id = ?`,
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