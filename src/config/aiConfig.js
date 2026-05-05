/**
 * AI Provider Configuration
 * 
 * Supported providers: 'ollama', 'openai', 'claude', 'gemini'
 * Set the AI_PROVIDER env variable to switch providers
 */

// Default provider configuration
const config = {
    // Active provider (set via VITE_AI_PROVIDER env var)
    provider: import.meta.env.VITE_AI_PROVIDER || 'ollama',

    // Provider-specific settings
    providers: {
        ollama: {
            baseUrl: import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434',
            model: import.meta.env.VITE_OLLAMA_MODEL || 'qwen3-vl:4b',
            endpoint: '/api/generate'
        },
        openai: {
            baseUrl: import.meta.env.VITE_OPENAI_URL || 'https://api.openai.com/v1',
            apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
            model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
            endpoint: '/chat/completions'
        },
        claude: {
            baseUrl: import.meta.env.VITE_CLAUDE_URL || 'https://api.anthropic.com/v1',
            apiKey: import.meta.env.VITE_CLAUDE_API_KEY || '',
            model: import.meta.env.VITE_CLAUDE_MODEL || 'claude-3-5-sonnet-latest',
            endpoint: '/messages'
        },
        gemini: {
            baseUrl: import.meta.env.VITE_GEMINI_URL || 'https://generativelanguage.googleapis.com/v1beta',
            apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
            model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash',
            endpoint: '/models'
        }
    },

    // Generation parameters
    generation: {
        temperature: parseFloat(import.meta.env.VITE_AI_TEMPERATURE) || 0.7,
        maxTokens: parseInt(import.meta.env.VITE_AI_MAX_TOKENS) || 4096,
        topP: parseFloat(import.meta.env.VITE_AI_TOP_P) || 0.9
    }
};

/**
 * Get the current provider configuration
 */
export const getActiveProvider = () => {
    const providerName = config.provider.toLowerCase();
    const providerConfig = config.providers[providerName];

    if (!providerConfig) {
        console.warn(`Unknown provider: ${providerName}, falling back to ollama`);
        return { name: 'ollama', ...config.providers.ollama };
    }

    return { name: providerName, ...providerConfig };
};

/**
 * Get generation parameters
 */
export const getGenerationParams = () => config.generation;

/**
 * Check if provider requires API key
 */
export const requiresApiKey = (provider) => {
    return ['openai', 'claude', 'gemini'].includes(provider);
};

/**
 * Validate provider configuration
 */
export const validateProvider = () => {
    const provider = getActiveProvider();

    if (requiresApiKey(provider.name) && !provider.apiKey) {
        throw new Error(`API key required for ${provider.name}. Set VITE_${provider.name.toUpperCase()}_API_KEY in .env`);
    }

    return true;
};

export default config;
