import { getMatchIdFromPath, normalizePayload } from './utils';

export const toLegacyPayload = (payload) => {
  const normalized = normalizePayload(payload);
  if (!normalized || typeof normalized !== 'object') return normalized;
  if (normalized.type) return normalized;
  if (normalized.payload?.type) return normalized.payload;
  return normalized;
};

export const mapLegacySendToCanonical = (destination, body) => {
  const normalizedBody = normalizePayload(body);
  return {
    // Backend expects literal destination-style event names like `/app/player.Move/{id}`.
    eventName: destination,
    envelope: normalizedBody,
  };
};

export const mapLegacyTopicToCanonicalEvents = (topic) => {
  const matchId = getMatchIdFromPath(topic);
  return {
    matchId,
    // Backend emits literal topic-style event names like `/topic/playerMove/{id}`.
    events: [topic],
  };
};

export const shouldDeliverLegacyTopicMessage = () => {
  // With direct topic event subscription, the event name already scopes delivery.
  return true;
};
