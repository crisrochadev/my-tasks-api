import test from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/app.js';

class FakeAIProvider {
  async generateText() {
    return JSON.stringify({
      intent: 'LIST_TASKS',
      confidence: 0.81,
      data: {}
    });
  }
}

test('deve criar tarefa via parser local sem fallback', async () => {
  const app = await buildApp();

  const response = await app.inject({
    method: 'POST',
    url: '/command',
    payload: {
      text: 'criar tarefa estudar node amanhã prioridade alta'
    }
  });

  assert.equal(response.statusCode, 200);
  const body = response.json();

  assert.equal(body.source, 'parser');
  assert.equal(body.action, 'create');
  assert.equal(body.data.title, 'estudar node');
  assert.equal(body.data.priority, 'high');

  await app.close();
});

test('deve listar tarefas via parser', async () => {
  const app = await buildApp();

  await app.inject({
    method: 'POST',
    url: '/command',
    payload: {
      text: 'criar tarefa revisar projeto hoje prioridade média'
    }
  });

  const response = await app.inject({
    method: 'POST',
    url: '/command',
    payload: {
      text: 'listar tarefas'
    }
  });

  assert.equal(response.statusCode, 200);
  const body = response.json();
  assert.equal(body.source, 'parser');
  assert.equal(body.action, 'list');
  assert.equal(body.data.length, 1);

  await app.close();
});

test('deve usar fallback de IA quando parser falhar', async () => {
  const app = await buildApp({ aiProvider: new FakeAIProvider() });

  const response = await app.inject({
    method: 'POST',
    url: '/command',
    payload: {
      text: 'quero ver tudo que está pendente'
    }
  });

  assert.equal(response.statusCode, 200);
  const body = response.json();
  assert.equal(body.source, 'ai');
  assert.equal(body.action, 'list');

  await app.close();
});
