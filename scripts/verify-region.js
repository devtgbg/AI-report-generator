import https from 'https';

const API_KEY = 'eff84f2e7992404403f7c4b6de95b0a7';
// Try the UUID we know mostly works or at least exists
const UUID = '092c2f81-b125-4fd3-8d74-fdaade1c7386';

const REGION_CANDIDATES = [
    'https://api.ap-south-1.zuperpro.com/api/v1',
    'https://ap-south-1.zuperpro.com/api/v1',
    'https://api-ap-south-1.zuperpro.com/api/v1',
    'https://prod-ap-south-1.zuperpro.com/api/v1'
];

console.log(`Testing Region: ap-south-1`);

const check = (url) => {
    console.log(`Checking: ${url}/jobs/${UUID}`);
    const req = https.request(`${url}/jobs/${UUID}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
        },
        timeout: 5000
    }, (res) => {
        if (res.statusCode === 200) {
            console.log(`\n✅ SUCCESS! Status 200 at: ${url}`);
        } else {
            console.log(`❌ Failed (${res.statusCode}) at: ${url}`);
        }
    });

    req.on('error', (e) => console.log(`Error ${url}: ${e.message}`));
    req.end();
};

REGION_CANDIDATES.forEach(check);
