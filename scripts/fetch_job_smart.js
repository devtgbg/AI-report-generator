import https from 'https';

const API_KEY = 'eff84f2e7992404403f7c4b6de95b0a7';
// Common Zuper endpoints
const BASE_URLS = [
    'https://api.zuperpro.com/api/v1',
    'https://eu.zuperpro.com/api/v1',
    'https://na.zuperpro.com/api/v1'
];

// The ID from the user (could be UUID or Job Code)
const TARGET_ID = '092c2f81-b125-4fd3-8d74-fdaade1c7386';
// Also try the job number from the screenshot just in case the UUID is wrong
const TARGET_CODE = 'JGE 32659';

const request = (method, url, params = {}) => {
    return new Promise((resolve, reject) => {
        let fullUrl = url;
        if (Object.keys(params).length > 0) {
            const query = new URLSearchParams(params).toString();
            fullUrl += `?${query}`;
        }

        console.log(`Testing: ${fullUrl}`);
        const req = https.request(fullUrl, {
            method,
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        resolve(data);
                    }
                } else {
                    reject({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
};

const findJob = async () => {
    console.log(`🔎 Starting Smart Job Search...`);
    console.log(`Target UUID: ${TARGET_ID}`);
    console.log(`Target Code: ${TARGET_CODE}`);

    for (const baseUrl of BASE_URLS) {
        console.log(`\n--- Checking Base URL: ${baseUrl} ---`);

        // 1. Try Direct Fetch by UUID
        try {
            console.log(`Attempting fetch by UUID...`);
            const job = await request('GET', `${baseUrl}/jobs/${TARGET_ID}`);
            console.log(`✅ SUCCESS! Found job details.`);
            console.log(`   Job Number: ${job.job_number}`);
            console.log(`   Category: ${job.category?.category_name}`);
            console.log(`   Correct API URL: ${baseUrl}`);
            return;
        } catch (e) {
            console.log(`   UUID fetch failed: ${e.status || e.message}`);
        }

        // 2. Try Search by Filters
        const filters = [
            { 'filter.job_code': TARGET_CODE },
            { 'filter.job_code': '32659' }, // Try without prefix
            { 'filter.work_order_number': TARGET_CODE },
            { 'filter.reference_no': TARGET_CODE }
        ];

        for (const filter of filters) {
            try {
                console.log(`Attempting search filter: ${JSON.stringify(filter)}`);
                const res = await request('GET', `${baseUrl}/jobs`, { ...filter, count: 1 });
                const jobs = res.data || res; // Handle if wrapped in data or direct list

                if (Array.isArray(jobs) && jobs.length > 0) {
                    const job = jobs[0];
                    console.log(`✅ FOUND via search!`);
                    console.log(`   Job UID: ${job.job_uid}`);
                    console.log(`   Job Number: ${job.job_number}`);
                    console.log(`   Correct API URL: ${baseUrl}`);
                    return;
                } else {
                    console.log(`   No results for filter.`);
                }
            } catch (e) {
                console.log(`   Search failed: ${e.status || e.message}`);
            }
        }
    }

    console.log(`\n❌ Could not find job on any known environment.`);
};

findJob();
