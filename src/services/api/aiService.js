const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'qwen3-vl:4b';

export const generateReportWithOllama = async (prompt) => {
    try {
        const response = await fetch(`${OLLAMA_URL}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.7,
                    top_p: 0.9
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.status}`);
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error('Error generating report with Ollama:', error);
        throw error;
    }
};

// For streaming responses (optional - better UX)
export const generateReportWithOllamaStreaming = async (prompt, onChunk) => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minute timeout

        const response = await fetch(`${OLLAMA_URL}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt: prompt,
                stream: true
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
                    // Skip invalid JSON lines
                }
            }
        }

        return fullResponse;
    } catch (error) {
        console.error('Error with streaming:', error);
        throw error;
    }
};
