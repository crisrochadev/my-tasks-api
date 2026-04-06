import { env } from './env.js';
import { OpenAIProvider } from '../providers/openaiProvider.js';
import { GeminiProvider } from '../providers/geminiProvider.js';

export function getAIProvider() {
  if (env.AI_PROVIDER === 'gemini') {
    return new GeminiProvider();
  }

  return new OpenAIProvider();
}
