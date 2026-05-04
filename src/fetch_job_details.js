import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Fetch Job Details using Node.js
 * 
 * Usage: 
 *   node src/fetch_job_details.js <JOB_ID>
 */

// 1. Load .env config
function loadEnv() {
    // Script is in src/, so .env is one level up (project root)
    const envPath = path.resolve(__dirname, '../.env');
    // Adjusted path: src/fetch_job_details.js -> ../../.env (Wait, script is in src/, so it is ../.env)
    // Actually, user said src/fetch_job_details.js.
    // __dirname is src/. .env is in root. So path.resolve(__dirname, '../.env') is correct.
    // User code had path.resolve(__dirname, '../.env').

    // BUT I will place it in src/fetch_job_details.js

    const actualEnvPath = path.resolve(__dirname, '../.env');

    if (fs.existsSync(actualEnvPath)) {
        const envContent = fs.readFileSync(actualEnvPath, 'utf-8');
        // Handle both CRLF and LF
        const lines = envContent.replace(/\r\n/g, '\n').split('\n');
        lines.forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim();
                process.env[key] = value;
            }
        });
    }
}

loadEnv();

// Support both VITE_ and non-VITE_ for this test script compatibility
const API_KEY = process.env.ZUPER_API_KEY || process.env.VITE_ZUPER_API_KEY;
// Defaults to 'pro', but let's try 'ap-south-1' if explicitly set in VITE
const REGION = process.env.ZUPER_ACCOUNT_REGION || process.env.VITE_ZUPER_ACCOUNT_REGION || 'pro';
// Note: user script had `const BASE_URL = 'https://${REGION}.zuperpro.com/api'`; 
// If REGION is 'ap-south-1', creates https://ap-south-1.zuperpro.com/api.
// If REGION is 'pro', creates https://pro.zuperpro.com/api.
const BASE_URL = `https://${REGION}.zuperpro.com/api`;

if (!API_KEY) {
    console.error("Error: ZUPER_API_KEY (or VITE_ZUPER_API_KEY) not found in .env file");
    process.exit(1);
}

// 2. Fetch Logic
async function fetchJobDetails(jobIdentifier) {
    console.log(`\nUsing Base URL: ${BASE_URL}\nSearching for: ${jobIdentifier}...\n`);

    // Check if UUID
    const isUuid = jobIdentifier.length > 30 && jobIdentifier.includes('-');
    let url;

    // Direct UUID fetch
    if (isUuid) {
        url = `${BASE_URL}/jobs/${jobIdentifier}`;
    } else {
        // Search by Job Code/Number
        url = `${BASE_URL}/jobs?filter.job_code=${jobIdentifier}&count=1`;
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-api-key': API_KEY,
                'accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!isUuid && Array.isArray(data.data) && data.data.length > 0) {
            const foundJob = data.data[0];
            console.log(`Found Job: ${foundJob.job_title} (UID: ${foundJob.job_uid})\nFetching full details...\n`);
            // Recursive call with key
            await fetchJobDetails(foundJob.job_uid);
            return;
        }

        console.log("✅ SUCCESS!");
        // Log lengths for quick check
        if (data.checklist) console.log(`Checklist Items: ${data.checklist.length}`);
        if (data.products) console.log(`Products: ${data.products.length}`);
        if (data.assets) console.log(`Assets: ${data.assets.length}`);

        // Write to file safely
        fs.writeFileSync('job_full_details.json', JSON.stringify(data, null, 2), 'utf8');
        console.log("Saved to job_full_details.json");

    } catch (error) {
        console.error("Fetch failed:", error.message);
    }
}

// 3. CLI Input Handling
const args = process.argv.slice(2);

if (args.length > 0) {
    // If argument provided: node script.js 12345
    fetchJobDetails(args[0]);
} else {
    // Interactive mode
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Enter Job ID or Job Number: ', (answer) => {
        if (answer.trim()) {
            fetchJobDetails(answer.trim());
        } else {
            console.log("No input provided.");
        }
        rl.close();
    });
}
