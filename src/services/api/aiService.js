/**
 * Multi-Provider AI Service
 * 
 * Supports: Ollama (local), OpenAI, Claude, Gemini
 * Configure provider via VITE_AI_PROVIDER in .env
 */

import { getActiveProvider, getGenerationParams, validateProvider } from '../../config/aiConfig';

// Provider-specific request builders
const requestBuilders = {
    ollama: (prompt, params) => ({
        model: getActiveProvider().model,
        prompt: prompt,
        stream: false,
        options: {
            temperature: params.temperature,
            top_p: params.topP,
            num_predict: params.maxTokens
        }
    }),

    openai: (prompt, params) => ({
        model: getActiveProvider().model,
        messages: [
            {
                role: 'system',
                content: `You are a Senior Vehicle Service Inspector and Technical Report Writer specializing in golf buggies, electric vehicles, and fleet maintenance.

Your expertise includes:
- Battery systems (lead-acid, lithium, voltage analysis)
- Electric motors and controllers
- Steering, suspension, and brake systems
- Bodywork and structural integrity assessment
- Safety compliance and roadworthiness evaluation

You create professional, detailed service inspection reports that are:
- Technically accurate with specific readings and measurements
- Categorized by severity (Dangerous, Recommended, Good)
- Actionable with clear recommendations
- Professional in tone but accessible to non-technical readers

Always prioritize safety-critical issues and provide specific part names, readings, and recommendations.`
            },
            { role: 'user', content: prompt }
        ],
        temperature: params.temperature,
        max_tokens: params.maxTokens,
        top_p: params.topP
    }),

    claude: (prompt, params) => ({
        model: getActiveProvider().model,
        max_tokens: params.maxTokens,
        messages: [
            { role: 'user', content: prompt }
        ]
    }),

    gemini: (prompt, params) => ({
        contents: [
            { parts: [{ text: prompt }] }
        ],
        generationConfig: {
            temperature: params.temperature,
            maxOutputTokens: params.maxTokens,
            topP: params.topP
        }
    })
};

// Provider-specific response parsers
const responseParsers = {
    ollama: (data) => data.response,
    openai: (data) => data.choices?.[0]?.message?.content || '',
    claude: (data) => data.content?.[0]?.text || '',
    gemini: (data) => data.candidates?.[0]?.content?.parts?.[0]?.text || ''
};

// Provider-specific headers
const getHeaders = (provider) => {
    const headers = { 'Content-Type': 'application/json' };

    if (provider.name === 'openai') {
        headers['Authorization'] = `Bearer ${provider.apiKey}`;
    } else if (provider.name === 'claude') {
        headers['x-api-key'] = provider.apiKey;
        headers['anthropic-version'] = '2023-06-01';
    }

    return headers;
};

// Build URL for each provider
const buildUrl = (provider) => {
    if (provider.name === 'gemini') {
        return `${provider.baseUrl}/models/${provider.model}:generateContent?key=${provider.apiKey}`;
    }
    return `${provider.baseUrl}${provider.endpoint}`;
};

/**
 * Generate report using configured AI provider
 */
export const generateReport = async (prompt) => {
    try {
        validateProvider();

        const provider = getActiveProvider();
        const params = getGenerationParams();

        console.log(`[AI Service] Using provider: ${provider.name} (${provider.model})`);

        const requestBody = requestBuilders[provider.name](prompt, params);
        const url = buildUrl(provider);

        const response = await fetch(url, {
            method: 'POST',
            headers: getHeaders(provider),
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`${provider.name} API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        return responseParsers[provider.name](data);

    } catch (error) {
        console.error('[AI Service] Error:', error);
        throw error;
    }
};

/**
 * Generate report with streaming (Ollama only for now)
 */
export const generateReportStreaming = async (prompt, onChunk) => {
    const provider = getActiveProvider();

    // Streaming only supported for Ollama currently
    if (provider.name !== 'ollama') {
        console.log('[AI Service] Streaming not supported for this provider, using standard request');
        const result = await generateReport(prompt);
        if (onChunk) onChunk(result);
        return result;
    }

    try {
        const params = getGenerationParams();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 180000);

        const response = await fetch(`${provider.baseUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: provider.model,
                prompt: prompt,
                stream: true,
                options: {
                    temperature: params.temperature,
                    top_p: params.topP
                }
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim());

            for (const line of lines) {
                try {
                    const json = JSON.parse(line);
                    if (json.response) {
                        fullResponse += json.response;
                        if (onChunk) onChunk(json.response);
                    }
                } catch (e) {
                    // Skip invalid JSON
                }
            }
        }

        return fullResponse;
    } catch (error) {
        console.error('[AI Service] Streaming error:', error);
        throw error;
    }
};

// Legacy exports for backward compatibility
export const generateReportWithOllama = generateReport;
export const generateReportWithOllamaStreaming = generateReportStreaming;
