import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { env } from './config/env.js';
import { buildLogger } from './config/logger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { TaskRepository } from './repositories/taskRepository.js';
import { TaskService } from './services/taskService.js';
import { AIFallbackService } from './services/aiFallbackService.js';
import { CommandService } from './services/commandService.js';
import { CommandController } from './controllers/commandController.js';
import { commandRoutes } from './routes/commandRoutes.js';
import { docsRoutes } from './routes/docsRoutes.js';

export async function buildApp(overrides = {}) {
  const app = Fastify({ loggerInstance: buildLogger() });

  await app.register(cors, {
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN
  });

  await app.register(helmet);

  await app.register(rateLimit, {
    max: 120,
    timeWindow: '1 minute'
  });

  const taskRepository = overrides.taskRepository ?? new TaskRepository();
  const taskService = overrides.taskService ?? new TaskService(taskRepository);
  const aiFallbackService =
    overrides.aiFallbackService ?? new AIFallbackService(overrides.aiProvider);
  const commandService =
    overrides.commandService ?? new CommandService(taskService, aiFallbackService);
  const commandController =
    overrides.commandController ?? new CommandController(commandService);

  await app.register(docsRoutes);
  await app.register(commandRoutes, { commandController });

  app.get('/health', async () => ({ status: 'ok' }));

  app.setErrorHandler(errorHandler);

  return app;
}
