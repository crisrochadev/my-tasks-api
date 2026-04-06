import { normalizeText } from '../utils/normalizeText.js';

const PRIORITY_MAP = {
  alta: 'high',
  alto: 'high',
  high: 'high',
  media: 'medium',
  medio: 'medium',
  medium: 'medium',
  baixa: 'low',
  baixo: 'low',
  low: 'low'
};

function parseDueDate(text, now = new Date()) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  if (/\bamanha\b/.test(text)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }

  if (/\bhoje\b/.test(text)) {
    return today.toISOString().slice(0, 10);
  }

  if (/\bdepois de amanha\b/.test(text)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 2);
    return d.toISOString().slice(0, 10);
  }

  const iso = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (iso) return iso[1];

  const br = text.match(/\b(\d{2})\/(\d{2})\/(\d{4})\b/);
  if (br) {
    const [, dd, mm, yyyy] = br;
    return `${yyyy}-${mm}-${dd}`;
  }

  return undefined;
}

function parsePriority(text) {
  const match = text.match(/\bprioridade\s+(alta|alto|high|media|medio|medium|baixa|baixo|low)\b/);
  if (match) return PRIORITY_MAP[match[1]];

  const fallback = text.match(/\b(alta|alto|high|media|medio|medium|baixa|baixo|low)\b/);
  if (fallback) return PRIORITY_MAP[fallback[1]];

  return undefined;
}

function extractTitleFromCreate(text) {
  const withoutAction = text.replace(/\b(criar|adicione?|adicionar|nova?)\b/g, '').trim();
  const withoutEntity = withoutAction.replace(/\b(tarefa|task)\b/g, '').trim();
  const title = withoutEntity
    .replace(/\b(amanha|hoje|depois de amanha)\b/g, '')
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, '')
    .replace(/\b\d{2}\/\d{2}\/\d{4}\b/g, '')
    .replace(/\bprioridade\s+\w+\b/g, '')
    .replace(/\b(alta|alto|high|media|medio|medium|baixa|baixo|low)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return title || undefined;
}

function parseId(text) {
  const match = text.match(/\b(?:id\s*)?(\d+)\b/);
  if (!match) return undefined;
  return Number(match[1]);
}

export function parseCommand(rawText, now = new Date()) {
  const text = normalizeText(rawText);

  if (!text) {
    return { intent: null, confidence: 0, data: {}, reason: 'empty_input' };
  }

  const isCreate = /\b(criar|adicionar|adicione|nova|novo)\b/.test(text) && /\b(tarefa|task)\b/.test(text);
  if (isCreate) {
    const title = extractTitleFromCreate(text);
    const dueDate = parseDueDate(text, now);
    const priority = parsePriority(text);

    const confidence = title ? 0.95 : 0.65;

    return {
      intent: 'CREATE_TASK',
      confidence,
      data: {
        title,
        dueDate,
        priority
      }
    };
  }

  const isList = /\b(listar|liste|mostrar|mostre|ver|exibir)\b/.test(text) && /\b(tarefas|tarefa|tasks|task)\b/.test(text);
  if (isList) {
    return {
      intent: 'LIST_TASKS',
      confidence: 0.98,
      data: {}
    };
  }

  const isUpdate = /\b(atualizar|editar|alterar|mudar)\b/.test(text) && /\b(tarefa|task)\b/.test(text);
  if (isUpdate) {
    const id = parseId(text);
    const priority = parsePriority(text);

    const titleMatch = text.match(/(?:titulo|title)\s+(.+)$/);
    const title = titleMatch?.[1]?.trim();

    const dueDate = parseDueDate(text, now);

    const confidence = id ? 0.9 : 0.6;

    return {
      intent: 'UPDATE_TASK',
      confidence,
      data: {
        id,
        title,
        dueDate,
        priority
      }
    };
  }

  const isLink = /\b(relacionar|vincular|ligar|conectar)\b/.test(text) && /\b(tarefa|task)\b/.test(text);
  if (isLink) {
    const ids = [...text.matchAll(/\b(\d+)\b/g)].map((m) => Number(m[1]));

    return {
      intent: 'LINK_TASKS',
      confidence: ids.length >= 2 ? 0.92 : 0.55,
      data: {
        taskId: ids[0],
        relatedTaskId: ids[1]
      }
    };
  }

  return {
    intent: null,
    confidence: 0,
    data: {},
    reason: 'no_rule_matched'
  };
}
