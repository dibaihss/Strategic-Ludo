import {
  buildPlayerColorsFromPlayers,
  getUserColorFromPlayerColors,
  getUserColorsFromPlayerColors,
  getWinnerSummary,
  isAppStateActive,
} from './GameScreen.logic.js';

describe('GameScreen.logic', () => {
  test('buildPlayerColorsFromPlayers maps players to default color ownership', () => {
    expect(buildPlayerColorsFromPlayers([
      { id: 'user-1' },
      { id: 'user-2' },
      { id: 'user-3' },
      { id: 'user-4' },
    ])).toEqual({
      blue: 'user-1',
      red: 'user-2',
      yellow: 'user-3',
      green: 'user-4',
    });
  });

  test('buildPlayerColorsFromPlayers falls back for two-player matches', () => {
    expect(buildPlayerColorsFromPlayers([
      { id: 'user-1' },
      { id: 'user-2' },
    ])).toEqual({
      blue: 'user-1',
      red: 'user-2',
      yellow: 'user-2',
      green: 'user-1',
    });
  });

  test('isAppStateActive excludes inactive background states', () => {
    expect(isAppStateActive('active')).toBe(true);
    expect(isAppStateActive('background')).toBe(false);
    expect(isAppStateActive('inactive')).toBe(false);
  });

  test('getUserColorsFromPlayerColors returns all owned colors', () => {
    expect(getUserColorsFromPlayerColors('user-1', {
      blue: 'user-1',
      red: 'user-2',
      yellow: 'user-3',
      green: 'user-1',
    })).toEqual(['blue', 'green']);
  });

  test('getUserColorFromPlayerColors returns the first owned color', () => {
    expect(getUserColorFromPlayerColors('user-1', {
      blue: 'user-1',
      red: 'user-2',
      yellow: 'user-3',
      green: 'user-1',
    })).toBe('blue');
  });

  test('getWinnerSummary returns winner and top rankings', () => {
    expect(getWinnerSummary({
      blue: [
        { isOut: true },
        { isOut: true },
        { isOut: true },
        { isOut: true },
      ],
      red: [
        { isOut: true },
        { isOut: true },
        { isOut: false },
        { isOut: false },
      ],
      yellow: [
        { isOut: true },
        { isOut: false },
        { isOut: false },
        { isOut: false },
      ],
      green: [
        { isOut: false },
        { isOut: false },
        { isOut: false },
        { isOut: false },
      ],
    })).toEqual({
      winningColor: 'blue',
      winnerResults: [
        { color: 'blue', completed: 4, isWinner: true },
        { color: 'red', completed: 2, isWinner: false },
        { color: 'yellow', completed: 1, isWinner: false },
      ],
    });
  });

  test('getWinnerSummary returns null without a winner', () => {
    expect(getWinnerSummary({
      blue: [{ isOut: true }, { isOut: false }],
      red: [{ isOut: false }, { isOut: false }],
    })).toBeNull();
  });
});