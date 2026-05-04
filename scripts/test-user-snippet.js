import https from 'https';

const API_KEY = 'eff84f2e7992404403f7c4b6de95b0a7';
const BASE_URL = 'https://pro.zuper.io/api';
const JOB_CODE = '32659';

const getJob = (jobCode) => {
    console.log(`Testing User Snippet Logic...`);
    console.log(`URL: ${BASE_URL}/jobs?filter.job_code=${jobCode}&count=1`);

    const req = https.request(`${BASE_URL}/jobs?filter.job_code=${jobCode}&count=1`, {
        method: 'GET',
        headers: {
            'x-api-key': API_KEY,
            'accept': 'application/json'
        }
    }, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            console.log(`Status: ${res.statusCode}`);
            if (res.statusCode === 200) {
                console.log("✅ Success! The user's snippet works.");
                console.log(data.substring(0, 200));
            } else {
                console.log("❌ Failed using user's snippet settings.");
                console.log("Body:", data.substring(0, 200));
            }
        });
    });

    req.on('error', e => console.error(e));
    req.end();
};

getJob(JOB_CODE);
