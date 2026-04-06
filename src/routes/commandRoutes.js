import { z } from 'zod';

const commandBodySchema = z.object({
  text: z.string().min(2).max(500)
});

export async function commandRoutes(fastify, options) {
  const { commandController } = options;

  fastify.post(
    '/command',
    {
      schema: {
        body: {
          type: 'object',
          required: ['text'],
          properties: {
            text: { type: 'string', minLength: 2, maxLength: 500 }
          }
        }
      }
    },
    async (req, reply) => {
      const body = commandBodySchema.parse(req.body);
      req.body = body;
      await commandController.handle(req, reply);
    }
  );
}
