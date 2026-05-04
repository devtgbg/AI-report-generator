import https from 'https';

const API_KEY = 'eff84f2e7992404403f7c4b6de95b0a7';
const UUID = '092c2f81-b125-4fd3-8d74-fdaade1c7386';

const ENDPOINTS = [
    'https://api.zuperpro.com/api/v1',
    'https://api.zuper.co/api/v1',
    'https://us-west-1c.zuperpro.com/api/v1',
    'https://eu.zuperpro.com/api/v1'
];

const testEndpoint = (baseUrl) => {
    console.log(`Testing Endpoint: ${baseUrl}`);
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
        }
    };

    const req = https.request(`${baseUrl}/jobs/${UUID}`, options, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            if (res.statusCode === 200) {
                console.log(`✅ SUCCESS! Correct Endpoint: ${baseUrl}`);
                console.log(`Data: ${data.substring(0, 100)}...`);
            } else if (res.statusCode === 404) {
                // 404 might mean endpoint ok but job not found, OR endpoint wrong path
                console.log(`⚠️ Endpoint reachable but 404: ${baseUrl}`);
            } else {
                console.log(`❌ Failed (${res.statusCode}): ${baseUrl}`);
            }
        });
    });

    req.on('error', e => console.log(`❌ Network Error for ${baseUrl}: ${e.message}`));
    req.end();
};

console.log("Starting Endpoint Discovery...");
ENDPOINTS.forEach(url => testEndpoint(url));
