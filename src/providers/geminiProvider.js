import { env } from '../config/env.js';

export class GeminiProvider {
  async generateText(prompt) {
    if (!env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is required for Gemini fallback.');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 180
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini provider error (${response.status})`);
    }

    const payload = await response.json();
    return payload?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  }
}
