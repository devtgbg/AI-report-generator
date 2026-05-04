import https from 'https';

const API_KEY = 'eff84f2e7992404403f7c4b6de95b0a7';
const URL = 'https://api.zuper.co/api/v1';
const UUID = '092c2f81-b125-4fd3-8d74-fdaade1c7386';

console.log(`Testing connection to: ${URL}/jobs/${UUID}`);

const req = https.request(`${URL}/jobs/${UUID}`, {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    }
}, (res) => {
    console.log(`Response Status: ${res.statusCode}`);
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => console.log('Body snippet:', data.substring(0, 100)));
});

req.on('error', (e) => {
    console.error(`❌ Connection Failed: ${e.code} - ${e.message}`);
    if (e.code === 'ENOTFOUND') {
        console.error("This means the domain 'api.zuper.co' does not exist.");
    }
});

req.end();
