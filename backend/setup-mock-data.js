const mock = require('./src/services/mock.service');
const init = require('./src/services/init.service');

async function setupMockData() {
    try {
        console.log('Initializing database...');
        await init.database();
        
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
