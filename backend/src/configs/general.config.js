require('dotenv').config();

const general = {
    port: process.env.PORT || 5000,
    JWTScrt: process.env.JWT_SECRET || "dev-secret-key-123",
    nodeEnv: process.env.NODE_ENV || 'development',
    allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000']
};

// Validate required environment variables in production
if (general.nodeEnv === 'production') {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is required in production');
    }
    if (!process.env.ALLOWED_ORIGINS) {
        throw new Error('ALLOWED_ORIGINS environment variable is required in production');
    }
}

module.exports = general;