import https from 'https';

const API_KEY = 'eff84f2e7992404403f7c4b6de95b0a7';
const UUID = '092c2f81-b125-4fd3-8d74-fdaade1c7386';

const CANDIDATES = [
    'https://api.zuperpro.com/api/v1',
    'https://na.zuperpro.com/api/v1',
    'https://eu.zuperpro.com/api/v1',
    'https://in.zuperpro.com/api/v1',
    'https://us-west-1c.zuperpro.com/api/v1', // Common for US
    'https://prod-api.zuperpro.com/api/v1'
];

console.log(`Searching for Job ${UUID} across regions...`);

let found = false;

const check = (url) => new Promise(resolve => {
    const req = https.request(`${url}/jobs/${UUID}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
        },
        timeout: 5000
    }, (res) => {
        if (res.statusCode === 200) {
            console.log(`\n🎉 FOUND IT! Correct base URL: ${url}`);
            found = true;
        } else {
            process.stdout.write('.'); // progress dot
        }
        resolve();
    });

    req.on('error', () => {
        process.stdout.write('x');
        resolve();
    });

    req.on('timeout', () => {
        req.destroy();
        resolve();
    });

    req.end();
});

const run = async () => {
    for (const url of CANDIDATES) {
        if (found) break;
        await check(url);
    }

    if (!found) {
        console.log(`\n❌ Could not find job on any common endpoint. Check if the UUID is correct.`);
    }
};

run();
