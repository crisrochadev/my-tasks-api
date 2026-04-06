import { parseCommand } from '../parsers/commandParser.js';

const MIN_CONFIDENCE = 0.75;

export class CommandService {
  constructor(taskService, aiFallbackService) {
    this.taskService = taskService;
    this.aiFallbackService = aiFallbackService;
  }

  async handle(text) {
    const parsed = parseCommand(text);

    if (parsed.intent && parsed.confidence >= MIN_CONFIDENCE) {
      const result = this.taskService.execute(parsed.intent, parsed.data);
      return {
        ...result,
        source: 'parser',
        parserConfidence: parsed.confidence
      };
    }

    const aiResult = await this.aiFallbackService.interpret(text);

    if (!aiResult.intent) {
      throw new Error('Could not identify intent from command.');
    }

    const result = this.taskService.execute(aiResult.intent, aiResult.data);

    return {
      ...result,
      source: 'ai',
      aiConfidence: aiResult.confidence,
      cached: aiResult.cached
    };
  }
}
