export const DEFAULT_PROTOCOL_VERSION = 1;

export const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

export const safeJsonParse = (value) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return value;
  try {
    return JSON.parse(trimmed);
  } catch (error) {
    return value;
  }
};

export const normalizePayload = (value) => {
  const firstPass = safeJsonParse(value);
  if (typeof firstPass === 'string') return firstPass;

  if (isObject(firstPass) && typeof firstPass.payload === 'string') {
    const parsedPayload = safeJsonParse(firstPass.payload);
    if (parsedPayload !== firstPass.payload) {
      return {
        ...firstPass,
        payload: parsedPayload,
      };
    }
  }

  return firstPass;
};

export const createRequestId = () => {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `req_${Date.now()}_${randomPart}`;
};

export const createEnvelope = ({ matchId, type, payload, meta = {} }) => ({
  matchId,
  type,
  payload,
  meta: {
    requestId: meta.requestId || createRequestId(),
    clientTs: meta.clientTs || Date.now(),
    version: meta.version || DEFAULT_PROTOCOL_VERSION,
    ...meta,
  },
});

export const getMatchIdFromPath = (value = '') => {
  const parts = String(value).split('/').filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : null;
};

export const isCriticalEvent = (eventName = '') =>
  [
    'player:select',
    'player:move',
    'player:enter',
    'turn:skip',
    'match:leave',
    'lobby:kick',
  ].includes(eventName);

