jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('./sessionApiShared.jsx', () => ({
  API_URL: 'http://localhost',
  isE2EMode: false,
  getE2EUser: jest.fn(),
  getE2EMatches: jest.fn(() => []),
  setE2EMatches: jest.fn(),
  requireAuthToken: jest.fn(),
}));

import sessionReducer, { addBotToMatch, createMatch, isCreateMatchReauthError, updateMatch } from './sessionSlice.jsx';
import { requireAuthToken } from './sessionApiShared.jsx';

const createStoredMatch = (overrides = {}) => ({
  id: 1,
  name: 'Match 1',
  status: 'waiting',
  users: [{ id: 101, name: 'Host' }],
  ...overrides,
});

describe('sessionSlice bot lobby support', () => {
  afterEach(() => {
    jest.clearAllMocks();
    delete global.fetch;
  });

  test('adds bots to the current match up to the maximum limit', () => {
    const baseMatch = createStoredMatch();
    let state = {
      matches: [baseMatch],
      currentMatch: baseMatch,
      currentMatchState: null,
      lastCommandAck: null,
      commandError: null,
      loading: false,
      error: null,
    };

    state = sessionReducer(state, addBotToMatch({
      matchId: 1,
      bot: { id: 'bot-1-1', name: 'Bot 1', isBot: true },
    }));
    state = sessionReducer(state, addBotToMatch({
      matchId: 1,
      bot: { id: 'bot-1-2', name: 'Bot 2', isBot: true },
    }));
    state = sessionReducer(state, addBotToMatch({
      matchId: 1,
      bot: { id: 'bot-1-3', name: 'Bot 3', isBot: true },
    }));
    state = sessionReducer(state, addBotToMatch({
      matchId: 1,
      bot: { id: 'bot-1-4', name: 'Bot 4', isBot: true },
    }));

    expect(state.currentMatch.users).toHaveLength(4);
    expect(state.currentMatch.users.filter((user) => user.isBot)).toHaveLength(3);
    expect(state.currentMatch.users.some((user) => user.id === 'bot-1-4')).toBe(false);
  });

  test('preserves locally added bots when a refreshed match payload arrives', () => {
    const existingMatch = createStoredMatch({
      users: [
        { id: 101, name: 'Host' },
        { id: 'bot-1-1', name: 'Bot 1', isBot: true },
      ],
    });
    const state = {
      matches: [existingMatch],
      currentMatch: existingMatch,
      currentMatchState: null,
      lastCommandAck: null,
      commandError: null,
      loading: false,
      error: null,
    };

    const refreshedState = sessionReducer(state, updateMatch(createStoredMatch({
      users: [{ id: 101, name: 'Host' }, { id: 202, name: 'Guest' }],
    })));

    expect(refreshedState.currentMatch.users).toEqual([
      { id: 101, name: 'Host' },
      { id: 202, name: 'Guest' },
      { id: 'bot-1-1', name: 'Bot 1', isBot: true },
    ]);
  });

  test('createMatch returns a structured re-login error when the backend user is missing', async () => {
    requireAuthToken.mockResolvedValue({ token: 'token-123' });
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: jest.fn().mockResolvedValue({ message: 'User not found' }),
    });

    const action = await createMatch()(jest.fn(), () => ({
      auth: {
        user: { id: 101 },
      },
    }), undefined);

    expect(action.type).toBe('session/createMatch/rejected');
    expect(action.payload).toEqual({
      code: 'USER_NOT_FOUND',
      message: 'User not found',
    });
    expect(isCreateMatchReauthError(action.payload)).toBe(true);

    const nextState = sessionReducer(undefined, action);
    expect(nextState.error).toBe('User not found');
  });
});
