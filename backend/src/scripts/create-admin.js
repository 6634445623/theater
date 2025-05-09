const db = require('../models/db.model');
const bcrypt = require('bcrypt');

async function createAdmin() {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db.query(
            'INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)',
            ['admin', hashedPassword, 1]
        );
        console.log('Admin user created successfully');
    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            console.log('Admin user already exists');
            return;
        }
        console.error('Error creating admin user:', err);
        throw err;
    }
}

createAdmin(); 