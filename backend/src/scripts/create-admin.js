const db = require('../models/db.model');
const { hashPassword } = require('../utils/password.util');

async function createAdmin() {
    try {
        const username = 'admin';
        const password = 'admin123'; // Change this to a secure password

        // Check if admin user already exists
        const existingAdmin = await db.query(
            'SELECT * FROM user WHERE username = ? LIMIT 1',
            [username]
        );

        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }

        // Create admin user
        const hashedPassword = await hashPassword(password);
        await db.query(
            'INSERT INTO user (username, password, is_admin) VALUES (?, ?, 1)',
            [username, hashedPassword]
        );

        console.log('Admin user created successfully');
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
}

createAdmin(); 