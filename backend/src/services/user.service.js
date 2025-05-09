const db = require("../models/db.model")
const helper = require("../utils/helper.util")
const JWT_SECRET = require("../configs/general.config").JWTScrt;
const jwt = require("jsonwebtoken");
const { hashPassword, comparePassword } = require("../utils/password.util");
const bcrypt = require("bcrypt");

async function auth(username, password) {
    try {
        // Get user from database
        const user = await db.query("SELECT * FROM users WHERE LOWER(username) = LOWER(?) LIMIT 1", [username]);
        if (!user || !user.length) {
            return { error: "Invalid username or password" };
        }

        // Compare password
        const match = await bcrypt.compare(password, user[0].password);
        if (!match) {
            return { error: "Invalid username or password" };
        }

        return { user: user[0] };
    } catch (err) {
        console.error("Error in auth:", err);
        throw err;
    }
}

async function insertUser(username, password) {
    try {
        // Check if user already exists
        const existingUser = await db.query("SELECT * FROM users WHERE LOWER(username) = LOWER(?) LIMIT 1", [username]);
        if (existingUser && existingUser.length) {
            return { error: "Username already exists" };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const result = await db.query(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            [username, hashedPassword]
        );

        return { id: result.lastInsertRowid };
    } catch (err) {
        console.error("Error in insertUser:", err);
        throw err;
    }
}

module.exports = {
    auth,
    insertUser
}