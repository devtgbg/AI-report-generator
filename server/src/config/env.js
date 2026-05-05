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

// Load order matches Vite/Next.js convention: .env provides defaults,
// .env.local overrides them (and is gitignored for local secrets).
dotenv.config({ path: path.join(rootDir, '.env') });
dotenv.config({ path: path.join(rootDir, '.env.local'), override: true });

export const config = {
    port: process.env.PORT || 7104,
    zuper: {
        apiKey: process.env.VITE_ZUPER_API_KEY || process.env.ZUPER_API_KEY,
        region: process.env.VITE_ZUPER_ACCOUNT_REGION || process.env.ZUPER_ACCOUNT_REGION || 'pro',
    },
    ai: {
        provider: (process.env.AI_PROVIDER || 'openai').toLowerCase(),
        generation: {
            temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.7,
            maxTokens: parseInt(process.env.AI_MAX_TOKENS) || 4096,
            topP: parseFloat(process.env.AI_TOP_P) || 0.9,
        },
        providers: {
            ollama: {
                baseUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
                model: process.env.OLLAMA_MODEL || 'qwen3-vl:4b',
            },
            openai: {
                baseUrl: process.env.OPENAI_URL || 'https://api.openai.com/v1',
                apiKey: process.env.OPENAI_API_KEY,
                model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            },
            claude: {
                baseUrl: process.env.CLAUDE_URL || 'https://api.anthropic.com/v1',
                apiKey: process.env.CLAUDE_API_KEY,
                model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-latest',
            },
            gemini: {
                baseUrl: process.env.GEMINI_URL || 'https://generativelanguage.googleapis.com/v1beta',
                apiKey: process.env.GEMINI_API_KEY,
                model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
            },
        },
    },
};

config.zuper.baseUrl = `https://${config.zuper.region}.zuperpro.com/api`;

if (!config.zuper.apiKey) {
    console.error("❌ CRITICAL: ZUPER_API_KEY is missing from environment!");
}

const activeProvider = config.ai.providers[config.ai.provider];
if (!activeProvider) {
    console.error(`❌ Unknown AI_PROVIDER: ${config.ai.provider}`);
} else if (['openai', 'claude', 'gemini'].includes(config.ai.provider) && !activeProvider.apiKey) {
    console.error(`❌ Missing API key for AI provider: ${config.ai.provider} (set ${config.ai.provider.toUpperCase()}_API_KEY)`);
}
