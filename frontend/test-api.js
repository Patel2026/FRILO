const axios = require('axios');

async function testApi() {
    try {
        const response = await axios.get('http://localhost:8000/api/sectors');
        console.log('Sectors:', response.data);
    } catch (error) {
        console.error('Error fetching sectors:', error.message);
        if (error.response) {
            console.error('Data:', error.response.data);
            console.error('Status:', error.response.status);
        }
    }
}

testApi();
