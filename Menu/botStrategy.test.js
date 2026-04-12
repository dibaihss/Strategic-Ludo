jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

import {
  buildBotActionCandidates,
  chooseScoredBotAction,
  getDifficultyProfile,
  scoreEnterCandidate,
  scoreMoveCandidate,
  selectBotCandidate,
} from './botStrategy';

const createCardsByColor = (overrides = {}) => ({
  blue: [],
  red: [],
  yellow: [],
  green: [],
  ...overrides,
});

const createSoldiersByColor = (overrides = {}) => ({
  blue: [],
  red: [],
  yellow: [],
  green: [],
  ...overrides,
});

const createSoldier = ({ id, color, position, onBoard = true, isOut = false }) => ({
  id,
  color,
  position,
  onBoard,
  isOut,
});

describe('botStrategy', () => {
  test('prefers finishing a soldier over a simple progress move', () => {
    const action = chooseScoredBotAction({
      color: 'red',
      difficulty: 'hard',
      disableNoise: true,
      cardsByColor: createCardsByColor({
        red: [
          { id: 7, value: 1, used: false },
          { id: 8, value: 2, used: false },
        ],
      }),
      soldiersByColor: createSoldiersByColor({
        red: [
          createSoldier({ id: 5, color: 'red', position: '6a' }),
          createSoldier({ id: 6, color: 'red', position: '1b' }),
        ],
      }),
    });

    expect(action.type).toBe('movePlayer');
    expect(action.payload.soldier.id).toBe(5);
    expect(action.reasons).toContain('finish-soldier');
  });

  test('prefers a capture when the landing square is acceptable', () => {
    const action = chooseScoredBotAction({
      color: 'yellow',
      difficulty: 'hard',
      disableNoise: true,
      cardsByColor: createCardsByColor({
        yellow: [{ id: 13, value: 2, used: false }],
      }),
      soldiersByColor: createSoldiersByColor({
        yellow: [
          createSoldier({ id: 9, color: 'yellow', position: '1c' }),
          createSoldier({ id: 10, color: 'yellow', position: '4c' }),
        ],
        blue: [createSoldier({ id: 1, color: 'blue', position: '3c' })],
      }),
    });

    expect(action.type).toBe('movePlayer');
    expect(action.payload.soldier.id).toBe(9);
    expect(action.reasons).toContain('capture-enemy');
  });

  test('does not treat landing on a safe zone as a capture for scoring', () => {
    const profile = getDifficultyProfile('hard');
    const scored = scoreMoveCandidate({
      candidate: {
        type: 'movePlayer',
        payload: {
          color: 'red',
          steps: 1,
          soldier: createSoldier({ id: 6, color: 'red', position: '2b' }),
          card: { id: 8, value: 1, used: false },
          targetPosition: '1b',
        },
      },
      cardsByColor: createCardsByColor(),
      soldiersByColor: createSoldiersByColor({
        blue: [createSoldier({ id: 1, color: 'blue', position: '1b' })],
      }),
      profile,
    });

    expect(scored.reasons).not.toContain('capture-enemy');
    expect(scored.metrics.captureTarget).toBeNull();
  });

  test('does not award spawn-capture on a safe entry square', () => {
    const profile = getDifficultyProfile('hard');
    const scored = scoreEnterCandidate({
      candidate: {
        type: 'enterNewSoldier',
        payload: {
          color: 'red',
          soldier: createSoldier({ id: 14, color: 'red', position: '2red', onBoard: false }),
          targetPosition: '1b',
        },
      },
      cardsByColor: createCardsByColor(),
      soldiersByColor: createSoldiersByColor({
        red: [createSoldier({ id: 14, color: 'red', position: '2red', onBoard: false })],
        blue: [createSoldier({ id: 1, color: 'blue', position: '1b' })],
      }),
      profile,
    });

    expect(scored.reasons).not.toContain('spawn-capture');
    expect(scored.metrics.captureTarget).toBeNull();
  });

  test('avoids a risky landing square when a safer alternative exists', () => {
    const action = chooseScoredBotAction({
      color: 'blue',
      difficulty: 'hard',
      disableNoise: true,
      cardsByColor: createCardsByColor({
        blue: [{ id: 1, value: 2, used: false }],
        red: [{ id: 7, value: 3, used: false }],
      }),
      soldiersByColor: createSoldiersByColor({
        blue: [
          createSoldier({ id: 1, color: 'blue', position: '1a' }),
          createSoldier({ id: 2, color: 'blue', position: '4a' }),
        ],
        red: [createSoldier({ id: 5, color: 'red', position: '12d' })],
      }),
    });

    expect(action.type).toBe('movePlayer');
    expect(action.payload.soldier.id).toBe(2);
    expect(action.reasons).not.toContain('risk');
  });

  test('chooses spawning when board presence is low and the move option is weak', () => {
    const action = chooseScoredBotAction({
      color: 'green',
      difficulty: 'normal',
      disableNoise: true,
      cardsByColor: createCardsByColor({
        green: [{ id: 19, value: 1, used: false }],
      }),
      soldiersByColor: createSoldiersByColor({
        green: [
          createSoldier({ id: 13, color: 'green', position: '11d' }),
          createSoldier({ id: 14, color: 'green', position: '2green', onBoard: false }),
        ],
      }),
    });

    expect(action.type).toBe('enterNewSoldier');
    expect(action.payload.color).toBe('green');
    expect(action.reasons).toContain('spawn-low-presence');
  });

  test('skips only when no legal action exists', () => {
    const action = chooseScoredBotAction({
      color: 'blue',
      difficulty: 'hard',
      disableNoise: true,
      cardsByColor: createCardsByColor(),
      soldiersByColor: createSoldiersByColor({
        blue: [
          createSoldier({ id: 1, color: 'blue', position: '', onBoard: false, isOut: true }),
          createSoldier({ id: 2, color: 'blue', position: '', onBoard: false, isOut: true }),
        ],
      }),
    });

    expect(action).toEqual(expect.objectContaining({
      type: 'skipTurn',
      reasons: ['no-legal-actions'],
    }));
  });

  test('normal and hard choose the top-scoring candidate deterministically when noise is disabled', () => {
    const candidates = [
      { type: 'movePlayer', payload: { id: 'a' }, score: 20, reasons: [] },
      { type: 'enterNewSoldier', payload: { id: 'b' }, score: 7, reasons: [] },
    ];

    expect(selectBotCandidate(candidates, { difficulty: 'normal', disableNoise: true })).toEqual(candidates[0]);
    expect(selectBotCandidate(candidates, { difficulty: 'hard', disableNoise: true })).toEqual(candidates[0]);
  });

  test('easy difficulty can deviate because of stronger noise', () => {
    const candidates = [
      { type: 'movePlayer', payload: { id: 'a' }, score: 20, reasons: [] },
      { type: 'enterNewSoldier', payload: { id: 'b' }, score: 2, reasons: [] },
    ];
    const randomValues = [0, 1];
    const randomFn = jest.fn(() => randomValues.shift());

    const selected = selectBotCandidate(candidates, { difficulty: 'easy', randomFn });

    expect(selected).toEqual(expect.objectContaining({
      type: 'enterNewSoldier',
    }));
  });

  test('candidate generation includes scored metadata for move and spawn actions', () => {
    const candidates = buildBotActionCandidates({
      color: 'green',
      difficulty: 'normal',
      cardsByColor: createCardsByColor({
        green: [{ id: 19, value: 2, used: false }],
      }),
      soldiersByColor: createSoldiersByColor({
        green: [
          createSoldier({ id: 13, color: 'green', position: '1d' }),
          createSoldier({ id: 14, color: 'green', position: '2green', onBoard: false }),
        ],
      }),
    });

    expect(candidates.some((candidate) => candidate.type === 'movePlayer' && typeof candidate.score === 'number')).toBe(true);
    expect(candidates.some((candidate) => candidate.type === 'enterNewSoldier' && Array.isArray(candidate.reasons))).toBe(true);
  });
});
