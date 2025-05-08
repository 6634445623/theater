const db = require("../models/db.model")
const helper = require("../utils/helper.util")
const JWT_SECRET = require("../configs/general.config").JWTScrt;
const jwt = require("jsonwebtoken");


async function authen(username, password) {
    const rows = await db.query("SELECT id, username FROM user WHERE username = ? AND password = ?", [username, password]);
    
    if (helper.emptyOrRows(rows).length !== 1) {
        const error = new Error("Invalid user");
        error.statusCode = 403;
        error.log = false;
        throw error;
    }

    const user = rows[0];
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });

    return token
}

async function insertUser(username, password) {
    try {
        const rows = await db.query("SELECT id FROM user WHERE username = ?", [username]);
        
        if (helper.emptyOrRows(rows).length > 0) {
            const error = new Error("Username already exists");
            error.statusCode = 409;
            error.log = false;
            throw error;
        }

        const result = await db.query("INSERT INTO user (username, password) VALUES (?, ?)", [username, password]);

        if (result.changes === 1) {
            const successMessage = "User created successfully!";
            return successMessage;
        } else {
            const error = new Error("Failed to create user");
            error.statusCode = 500;
            error.log = false;
            throw error;
        }
    } catch (err) {
        console.error(`Error while inserting user: ${err.message}`);
        throw err;
    }
}

module.exports = {
    authen,
    insertUser
}