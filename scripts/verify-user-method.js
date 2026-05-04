const apiKey = 'eff84f2e7992404403f7c4b6de95b0a7';
const baseUrl = 'https://pro.zuper.io/api';
// const baseUrl = 'https://api.zuperpro.com/api/v1'; // Logic to toggle if needed

async function getJob(jobCode) {
    console.log(`Testing URL: ${baseUrl}...`);
    const url = `${baseUrl}/jobs?filter.job_code=${jobCode}&count=1`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-api-key': apiKey,
                'accept': 'application/json'
            }
        });

        console.log(`Status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            // Try to read body even if error
            const text = await response.text();
            console.error(`Error Body: ${text.substring(0, 200)}`);
            return;
        }

        const data = await response.json();
        console.log("✅ Success!");
        console.log(JSON.stringify(data, null, 2).substring(0, 500));
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

getJob('32659');
