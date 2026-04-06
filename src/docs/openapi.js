export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'My Tasks API',
    version: '1.0.0',
    description:
      'API para interpretação de comandos em linguagem natural com parser local e fallback de IA.'
  },
  servers: [{ url: 'http://localhost:3000', description: 'Servidor local' }],
  tags: [{ name: 'Health' }, { name: 'Command' }],
  components: {
    schemas: {
      CommandRequest: {
        type: 'object',
        required: ['text'],
        properties: {
          text: {
            type: 'string',
            minLength: 2,
            maxLength: 500,
            example: 'criar tarefa estudar node amanhã prioridade alta'
          }
        }
      },
      CommandResponse: {
        type: 'object',
        properties: {
          action: { type: 'string', example: 'create' },
          source: { type: 'string', enum: ['parser', 'ai'], example: 'parser' },
          data: {
            oneOf: [{ type: 'object' }, { type: 'array', items: { type: 'object' } }]
          },
          message: { type: 'string', example: 'Tarefa criada com sucesso' }
        }
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'ok' }
        }
      }
    }
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Verifica status da API',
        responses: {
          200: {
            description: 'API saudável',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthResponse' }
              }
            }
          }
        }
      }
    },
    '/command': {
      post: {
        tags: ['Command'],
        summary: 'Interpreta e executa um comando em linguagem natural',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CommandRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Comando processado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CommandResponse' }
              }
            }
          }
        }
      }
    }
  }
};
