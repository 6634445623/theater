const db = require('../models/db.model');
const bcrypt = require('bcrypt');

async function createTestUser() {
    try {
        const hashedPassword = await bcrypt.hash('test123', 10);
        await db.query(
            'INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)',
            ['test', hashedPassword, 0]
        );
        console.log('Test user created successfully');
    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            console.log('Test user already exists');
            return;
        }
        console.error('Error creating test user:', err);
        throw err;
    }
}

createTestUser(); 