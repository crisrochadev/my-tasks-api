import { env } from '../config/env.js';

export class OpenAIProvider {
  async generateText(prompt) {
    if (!env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required for OpenAI fallback.');
    }

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL,
        input: prompt,
        max_output_tokens: 180,
        temperature: 0
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI provider error (${response.status})`);
    }

    const payload = await response.json();
    return payload.output_text ?? '';
  }
}
