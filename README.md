# My Tasks API

API REST em Node.js + Fastify para interpretação de comandos em linguagem natural, com **parsing local obrigatório** e uso de IA apenas como fallback.

## Stack

- Node.js 20+
- Fastify
- Zod
- Pino

## Arquitetura

```text
src/
  config/
  controllers/
  middlewares/
  parsers/
  providers/
  repositories/
  routes/
  services/
  utils/
```

## Fluxo híbrido (economia de tokens)

1. Recebe comando em `/command`
2. `commandParser` tenta inferir intenção e dados estruturados
3. Se confiança >= 0.75, executa localmente
4. Se falha/baixa confiança, aciona IA com prompt curto e sem histórico
5. Executa ação e retorna fonte (`parser` ou `ai`)

## Executar

```bash
cp .env.example .env
npm install
npm run dev
```

## Endpoint principal

`POST /command`

Entrada:

```json
{ "text": "criar tarefa estudar node amanhã prioridade alta" }
```

Saída (exemplo):

```json
{
  "action": "create",
  "source": "parser",
  "data": {
    "id": 1,
    "title": "estudar node",
    "priority": "high"
  },
  "message": "Tarefa criada com sucesso"
}
```

## Exemplos de comandos

- Criação: `criar tarefa estudar node amanhã prioridade alta`
- Listagem: `listar tarefas`
- Atualização: `atualizar tarefa 1 prioridade baixa`
- Relacionar: `relacionar tarefa 1 com tarefa 2`
- Fallback IA: `quero organizar minhas pendências`

## Segurança

- `.env` para segredos
- `helmet`, `cors`, `rate-limit`
- validação de payload com `zod`
- logs com redaction de dados sensíveis
