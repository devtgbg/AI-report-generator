import { config } from '../config/env.js';

const SYSTEM_PROMPT = `You are a Senior Vehicle Service Inspector and Technical Report Writer specializing in golf buggies, electric vehicles, and fleet maintenance.

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

Always prioritize safety-critical issues and provide specific part names, readings, and recommendations.`;

const buildRequest = {
  ollama: (prompt, p, params) => ({
    url: `${p.baseUrl}/api/generate`,
    headers: { 'Content-Type': 'application/json' },
    body: {
      model: p.model,
      prompt,
      stream: false,
      options: {
        temperature: params.temperature,
        top_p: params.topP,
        num_predict: params.maxTokens,
      },
    },
  }),
  openai: (prompt, p, params) => ({
    url: `${p.baseUrl}/chat/completions`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${p.apiKey}`,
    },
    body: {
      model: p.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: params.temperature,
      max_tokens: params.maxTokens,
      top_p: params.topP,
    },
  }),
  claude: (prompt, p, params) => ({
    url: `${p.baseUrl}/messages`,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': p.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: {
      model: p.model,
      max_tokens: params.maxTokens,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    },
  }),
  gemini: (prompt, p, params) => ({
    url: `${p.baseUrl}/models/${p.model}:generateContent?key=${p.apiKey}`,
    headers: { 'Content-Type': 'application/json' },
    body: {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: params.temperature,
        maxOutputTokens: params.maxTokens,
        topP: params.topP,
      },
    },
  }),
};

const parseResponse = {
  ollama: (data) => data.response || '',
  openai: (data) => data.choices?.[0]?.message?.content || '',
  claude: (data) => data.content?.[0]?.text || '',
  gemini: (data) => data.candidates?.[0]?.content?.parts?.[0]?.text || '',
};

const PROVIDERS_REQUIRING_KEY = ['openai', 'claude', 'gemini'];

export const generate = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid `prompt` in request body' });
    }

    const providerName = (config.ai.provider || 'openai').toLowerCase();
    const providerConfig = config.ai.providers[providerName];

    if (!providerConfig) {
      return res.status(500).json({ error: `Unknown AI provider configured: ${providerName}` });
    }
    if (PROVIDERS_REQUIRING_KEY.includes(providerName) && !providerConfig.apiKey) {
      return res.status(500).json({ error: `Missing API key for provider: ${providerName}` });
    }

    const builder = buildRequest[providerName];
    const parser = parseResponse[providerName];
    if (!builder || !parser) {
      return res.status(500).json({ error: `Provider not implemented: ${providerName}` });
    }

    const { url, headers, body } = builder(prompt, providerConfig, config.ai.generation);

    console.log(`[AI] Generating via ${providerName} (${providerConfig.model})`);

    const upstream = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error(`[AI] ${providerName} error ${upstream.status}: ${errText}`);
      return res.status(502).json({
        error: `AI provider error (${upstream.status})`,
        details: errText.slice(0, 500),
      });
    }

    const data = await upstream.json();
    const text = parser(data);

    return res.json({
      provider: providerName,
      model: providerConfig.model,
      text,
    });
  } catch (err) {
    console.error('[AI] Unexpected error:', err);
    return res.status(500).json({ error: err.message || 'Internal AI error' });
  }
};
