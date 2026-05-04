import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
// config/env.js -> src/config -> src -> server -> root (4 levels up?)
// No, server/src/config/env.js -> server/src/config -> server/src -> server -> root
// So it's 3 levels up: ../../../.env
// Wait, path.resolve(__dirname, '../../../.env')

const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../');

dotenv.config({ path: path.join(rootDir, '.env') });
dotenv.config({ path: path.join(rootDir, '.env.local') });

export const config = {
    port: process.env.PORT || 5000,
    zuper: {
        apiKey: process.env.VITE_ZUPER_API_KEY || process.env.ZUPER_API_KEY,
        region: process.env.VITE_ZUPER_ACCOUNT_REGION || process.env.ZUPER_ACCOUNT_REGION || 'pro',
    }
};

config.zuper.baseUrl = `https://${config.zuper.region}.zuperpro.com/api`;

if (!config.zuper.apiKey) {
    console.error("❌ CRITICAL: ZUPER_API_KEY is missing from environment!");
}
