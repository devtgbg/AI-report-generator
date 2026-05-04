const apiKey = 'eff84f2e7992404403f7c4b6de95b0a7';
const baseUrl = 'https://api.zuperpro.com/api/v1';
const jobCode = '32659';

async function testHeader(name, headers) {
    console.log(`\n--- Testing ${name} ---`);
    console.log(`URL: ${baseUrl}/jobs?filter.job_code=${jobCode}&count=1`);
    try {
        const res = await fetch(`${baseUrl}/jobs?filter.job_code=${jobCode}&count=1`, {
            headers: { ...headers, 'Content-Type': 'application/json' }
        });
        const text = await res.text();
        console.log(`Status: ${res.status}`);
        console.log(`Body Start: ${text.substring(0, 50)}`); // Check for <doctype or {

        if (res.status === 200) {
            try {
                const json = JSON.parse(text);
                const count = json.data ? json.data.length : (Array.isArray(json) ? json.length : 0);
                console.log(`✅ Success! Found ${count} jobs.`);
            } catch (jsonError) {
                console.log(`❌ Failed to parse JSON. Error: ${jsonError.message}. Body: ${text.substring(0, 100)}`);
            }
        } else {
            console.log(`❌ Failed. Body: ${text.substring(0, 100)}`);
        }
    } catch (e) {
        console.log(`Error: ${e.message}`);
    }
}

async function run() {
    await testHeader('Authorization: Bearer', { 'Authorization': `Bearer ${apiKey}` });
    await testHeader('x-api-key', { 'x-api-key': apiKey });
}

run();
