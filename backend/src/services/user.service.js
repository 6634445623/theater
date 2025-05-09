const db = require("../models/db.model")
const helper = require("../utils/helper.util")
const JWT_SECRET = require("../configs/general.config").JWTScrt;
const jwt = require("jsonwebtoken");
const { hashPassword, comparePassword } = require("../utils/password.util");

async function authen(username, password) {
    const user = await db.query("SELECT * FROM user WHERE username = ? LIMIT 1", [username]);
    if (user) {
        const isValid = await comparePassword(password, user.password);
        if (isValid) {
            const token = jwt.sign({
                id: user.id,
                username: user.username,
                is_admin: user.is_admin
            }, JWT_SECRET, { expiresIn: '24h' });
            return { token };
        }
    }
    const error = new Error("Invalid username or password");
    error.statusCode = 401;
    throw error;
}

async function insertUser(username, password) {
    try {
        const hashedPassword = await hashPassword(password);
        await db.query("INSERT INTO user (username, password) VALUES (?, ?)", [username, hashedPassword]);
        return { msg: "User registered successfully" };
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            const error = new Error("Username already exists");
            error.statusCode = 409;
            throw error;
        }
        throw error;
    }
}

module.exports = {
    authen,
    insertUser
}