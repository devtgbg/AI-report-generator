import axios from 'axios';
import { config } from '../config/env.js';

const getHeaders = () => ({
    'x-api-key': config.zuper.apiKey,
    'accept': 'application/json'
});

export const getJobDetails = async (req, res) => {
    let { identifier } = req.params;

    // Robustness: If identifier contains a URL-like structure, try to extract UUID
    if (identifier.includes('/jobs/')) {
        const urlMatch = identifier.match(/\/jobs\/([0-9a-fA-F-]{36})/);
        if (urlMatch && urlMatch[1]) {
            console.log(`[API] Extracted UUID from URL input: ${urlMatch[1]}`);
            identifier = urlMatch[1];
        }
    }

    console.log(`\n[API] Request for Job: ${identifier}`);

    try {
        let jobUid = identifier;

        // 1. Check if it's NOT a UUID (Simple check: length < 30 or no hyphens)
        const isUuid = identifier.length > 30 && identifier.includes('-');

        if (!isUuid) {
            console.log(`[API] '${identifier}' is not a UUID. Searching...`);
            const searchUrl = `${config.zuper.baseUrl}/jobs?filter.job_code=${identifier}&count=1`;

            const searchRes = await axios.get(searchUrl, { headers: getHeaders() });
            const jobs = searchRes.data.data;

            if (Array.isArray(jobs) && jobs.length > 0) {
                jobUid = jobs[0].job_uid;
                console.log(`[API] Found Job UID: ${jobUid} for code ${identifier}`);
            } else {
                return res.status(404).json({ error: 'Job not found via search' });
            }
        }

        // 2. Fetch Full Details by UID
        console.log(`[API] Fetching details for UID: ${jobUid}`);
        const detailsUrl = `${config.zuper.baseUrl}/jobs/${jobUid}`;
        const detailRes = await axios.get(detailsUrl, { headers: getHeaders() });

        console.log(`[API] Success! Sending data.`);
        res.json(detailRes.data);

    } catch (error) {
        console.error(`[API] Error:`, error.message);
        if (error.response) {
            // Forward upstream error
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};
