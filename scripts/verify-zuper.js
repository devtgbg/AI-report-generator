import https from 'https';

const API_KEY = 'eff84f2e7992404403f7c4b6de95b0a7';
const UUID = '092c2f81-b125-4fd3-8d74-fdaade1c7386';

const COMPANY_CANDIDATES = ['jge', 'jgetechs', 'jge-techs', 'amc', 'zuper'];

const postJSON = (url, body) => new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    }, res => {
        let resp = '';
        res.on('data', c => resp += c);
        res.on('end', () => resolve({ status: res.statusCode, body: resp }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
});

const getJSON = (url) => new Promise((resolve, reject) => {
    const req = https.request(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
        }
    }, res => {
        let resp = '';
        res.on('data', c => resp += c);
        res.on('end', () => resolve({ status: res.statusCode, body: resp }));
    });
    req.on('error', reject);
    req.end();
});

const discover = async () => {
    console.log("🔍 Attempting to discover API URL via Config API...");

    for (const company of COMPANY_CANDIDATES) {
        try {
            console.log(`Checking company: '${company}'...`);
            const res = await postJSON('https://accounts.zuperpro.com/api/config', { company_name: company });

            if (res.status === 200) {
                const config = JSON.parse(res.body);
                console.log(`✅ FOUND CONFIG for '${company}'!`);
                console.log(`DC API URL: ${config.dc_api_url}`);

                const apiUrl = `${config.dc_api_url}/api/v1`;
                console.log(`Testing discovered URL: ${apiUrl}...`);

                const jobRes = await getJSON(`${apiUrl}/jobs/${UUID}`);
                if (jobRes.status === 200) {
                    console.log(`🎉 SUCCESS! Verified Job Access.`);
                    console.log(`Found correct API URL: ${apiUrl}`);
                    process.exit(0);
                } else {
                    console.log(`❌ URL found but Job fetch failed (${jobRes.status}). Key might be wrong for this company.`);
                }
            }
        } catch (e) {
            console.log(`Error checking ${company}:`, e.message);
        }
    }

    console.log("⚠️ Discovery failed. Falling back to direct endpoint tests...");
    // Fallback list
    const fallbacks = [
        'https://api.zuperpro.com/api/v1',
        'https://eu.zuperpro.com/api/v1',
        'https://na.zuperpro.com/api/v1'
    ];

    for (const url of fallbacks) {
        const res = await getJSON(`${url}/jobs/${UUID}`);
        if (res.status === 200) {
            console.log(`🎉 SUCCESS via fallback! URL: ${url}`);
            return;
        }
        console.log(`Failed fallback ${url}: ${res.status}`);
    }
};

discover();
