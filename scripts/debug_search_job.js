import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });

const API_KEY = process.env.VITE_ZUPER_API_KEY;
const REGION = process.env.VITE_ZUPER_ACCOUNT_REGION || 'ap-south-1';
const BASE_URL = `https://${REGION}.zuperpro.com/api`;

const getHeaders = () => ({
    'x-api-key': API_KEY,
    'Content-Type': 'application/json'
});

const searchTerm = process.argv[2] || '32659';

async function searchJobs() {
    try {
        console.log(`Searching for "${searchTerm}"...`);
        const queries = [
            `filter.job_code=${searchTerm}`,
            `filter.work_order_number=${searchTerm}`,
            `search=${searchTerm}`
        ];

        for (const query of queries) {
            const url = `${BASE_URL}/jobs?${query}`;
            console.log(`GET ${url}`);
            try {
                const res = await axios.get(url, { headers: getHeaders() });
                const jobs = res.data.data || [];

                if (jobs.length > 0) {
                    console.log(`\n--- Matches for ${query} ---`);
                    jobs.forEach(j => {
                        console.log(`UID: ${j.job_uid}`);
                        console.log(`Title: ${j.job_title}`);
                        console.log(`Code: ${j.job_code} | WO: ${j.work_order_number}`);
                        console.log(`Status: ${j.current_job_status?.status_name}`);
                        console.log(`Recurrence: ${j.is_recurrence ? 'Yes' : 'No'}`);
                        console.log('-------------------------');

                        // Check for completed one
                        if (j.current_job_status?.status_name === 'Job Completed') {
                            console.log(">>> FOUND COMPLETED JOB! Fetching details...");
                            fetchFullDetails(j.job_uid);
                        }
                    });
                } else {
                    console.log("No matches.");
                }
            } catch (e) {
                console.error(`Error query ${query}: ${e.message}`);
            }
        }

    } catch (error) {
        console.error("Fatal:", error);
    }
}

async function fetchFullDetails(uid) {
    const url = `${BASE_URL}/jobs/${uid}`;
    const res = await axios.get(url, { headers: getHeaders() });
    fs.writeFileSync('job_correct.json', JSON.stringify(res.data, null, 2));
    console.log(`\n✅ Saved COMPLETED job details to job_correct.json`);
}

searchJobs();
