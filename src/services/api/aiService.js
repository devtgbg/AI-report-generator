const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:7104/api';

/**
 * Generate a report by calling the backend AI proxy.
 * All provider selection, API keys, and system prompts live on the server.
 */
export const generateReport = async (prompt) => {
  const response = await fetch(`${API_BASE}/ai/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `AI proxy error: ${response.status}`);
  }

  const data = await response.json();
  console.log(`[AI Service] Provider: ${data.provider} (${data.model})`);
  return data.text || '';
};

/**
 * Streaming wrapper. The backend currently returns the full response as one
 * payload, so we invoke onChunk once with the complete text. This keeps the
 * existing hook API stable.
 */
export const generateReportStreaming = async (prompt, onChunk) => {
  const text = await generateReport(prompt);
  if (onChunk) onChunk(text);
  return text;
};

// Legacy aliases — kept so existing imports keep working.
export const generateReportWithOllama = generateReport;
export const generateReportWithOllamaStreaming = generateReportStreaming;
