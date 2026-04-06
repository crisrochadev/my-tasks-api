import pino from 'fastify/lib/logger-pino.js';
import { env } from './env.js';

export function buildLogger() {
  return pino({
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport:
      env.ENABLE_PRETTY_LOGS && env.NODE_ENV !== 'production'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard'
            }
          }
        : undefined,
    redact: {
      paths: ['req.headers.authorization', '*.apiKey', '*.token', '*.password'],
      censor: '[REDACTED]'
    }
  });
}
