import https from 'https';

const API_KEY = 'eff84f2e7992404403f7c4b6de95b0a7';
const UUID = '092c2f81-b125-4fd3-8d74-fdaade1c7386';

const URLS = [
    'https://api.zuperpro.com/api/v1',
    'https://ap-south-1.zuperpro.com/api/v1'
];

const check = (url) => {
    https.get(`${url}/jobs/${UUID}`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
    }, (res) => {
        let data = '';
        res.on('data', d => data += d);
        res.on('end', () => {
            console.log(`${url} -> Status: ${res.statusCode}`);
            if (res.statusCode === 200) console.log("   ✅ Data found");
            else console.log("   ❌ Failed");
        });
    }).on('error', e => console.log(`${url} -> Error: ${e.message}`));
};

URLS.forEach(check);
