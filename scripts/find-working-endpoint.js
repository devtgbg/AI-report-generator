import https from 'https';

const apiKey = 'eff84f2e7992404403f7c4b6de95b0a7';
const jobCode = '32659';

const candidates = [
    'https://api.zuperpro.com/api/v1',
    'https://pro.zuper.io/api',
    'https://pro.zuper.io/api/v1',
    'https://api.ap-south-1.zuperpro.com/api/v1',
    'https://api-ap-south-1.zuperpro.com/api/v1',
    'https://prod-ap-south-1.zuperpro.com/api/v1',
    'https://zuperpro.com/api/v1',
    'https://api.zuper.co/api/v1'
];

async function check(url) {
    return new Promise(resolve => {
        const fullUrl = `${url}/jobs?filter.job_code=${jobCode}&count=1`;
        console.log(`Checking: ${fullUrl}`);
        const req = https.get(fullUrl, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json'
            },
            timeout: 5000
        }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        if (data.trim().startsWith('<')) {
                            console.log(`[HTML] ${url}`);
                        } else {
                            JSON.parse(data);
                            console.log(`[JSON] ${url} <<< FOUND`);
                        }
                    } catch (e) {
                        console.log(`[BAD JSON] ${url}`);
                    }
                } else {
                    console.log(`[${res.statusCode}] ${url}`);
                }
                resolve();
            });
        });
        req.on('error', e => {
            console.log(`❌ ${url} -> Error: ${e.message}`);
            resolve();
        });
    });
}

(async () => {
    for (const url of candidates) {
        await check(url);
    }
})();
