const db = require('../models/db.model');
const { hashPassword } = require('../utils/password.util');

async function createAdmin() {
    try {
        const username = 'admin';
        const password = 'admin123'; // Change this to a secure password

        // Create admin user
        const hashedPassword = await hashPassword(password);
        const result = await db.query(
            'INSERT INTO user (username, password, is_admin) VALUES (?, ?, 1)',
            [username, hashedPassword]
        );

        console.log('Admin user created successfully');
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            console.log('Admin user already exists');
            return;
        }
        console.error('Error creating admin user:', error);
    }
}

createAdmin(); 