const db = require('../models/db.model');
const { hashPassword } = require('../utils/password.util');

async function createTestUser() {
    try {
        const username = 'user';
        const password = 'user123';

        // Create test user
        const hashedPassword = await hashPassword(password);
        const result = await db.query(
            'INSERT INTO user (username, password, is_admin) VALUES (?, ?, 0)',
            [username, hashedPassword]
        );

        console.log('Test user created successfully');
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            console.log('Test user already exists');
            return;
        }
        console.error('Error creating test user:', error);
    }
}

createTestUser(); 