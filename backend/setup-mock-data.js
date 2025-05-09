const mock = require('./src/services/mock.service');
const init = require('./src/services/init.service');
const { execSync } = require('child_process');

async function setupMockData() {
    try {
        console.log('Initializing database...');
        await init.database();
        
        console.log('Creating admin user...');
        execSync('node src/scripts/create-admin.js', { stdio: 'inherit' });
        
        console.log('Creating test user...');
        execSync('node src/scripts/create-test-user.js', { stdio: 'inherit' });
        
        console.log('Inserting mock data...');
        const result = await mock.insertMockData();
        
        console.log(result.message);
        process.exit(0);
    } catch (error) {
        console.error('Error setting up mock data:', error);
        process.exit(1);
    }
}

setupMockData();
