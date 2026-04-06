import { getAIProvider } from '../config/aiProvider.js';

const fallbackCache = new Map();

function buildPrompt(text) {
  const compactText = text.slice(0, 280);
  return [
    'Converta o comando para JSON SEM explicações.',
    'Intenções válidas: CREATE_TASK, LIST_TASKS, UPDATE_TASK, LINK_TASKS.',
    'Formato: {"intent":"...","data":{...},"confidence":0..1}.',
    `Comando: ${compactText}`
  ].join(' ');
}

export class AIFallbackService {
  constructor(provider = getAIProvider()) {
    this.provider = provider;
  }

  async interpret(text) {
    const key = text.trim().toLowerCase();
    if (fallbackCache.has(key)) {
      return { ...fallbackCache.get(key), cached: true };
    }

    const prompt = buildPrompt(text);
    const content = await this.provider.generateText(prompt);

    const parsed = JSON.parse(content);

    const result = {
      intent: parsed.intent ?? null,
      data: parsed.data ?? {},
      confidence: Number(parsed.confidence ?? 0)
    };

    fallbackCache.set(key, result);
    return { ...result, cached: false };
  }
}
