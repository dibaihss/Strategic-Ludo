export const buildPlayerColorsFromPlayers = (players = []) => {
  if (!Array.isArray(players) || players.length < 2) return null;

  return {
    blue: players[0].id,
    red: players[1].id,
    yellow: players[2] ? players[2].id : players[1].id,
    green: players[3] ? players[3].id : players[0].id,
  };
};

export const isAppStateActive = (appState) => appState !== 'background' && appState !== 'inactive';

export const getUserColorsFromPlayerColors = (userId, colors) => {
  if (!userId || !colors) return [];

  return Object.entries(colors)
    .filter(([, ownerId]) => String(ownerId) === String(userId))
    .map(([color]) => color);
};

export const getUserColorFromPlayerColors = (userId, colors) => {
  if (!userId || !colors) return null;

  const userEntry = Object.entries(colors).find(([, ownerId]) => String(ownerId) === String(userId));
  return userEntry ? userEntry[0] : null;
};

export const getWinnerSummary = (soldiersByColor) => {
  const results = Object.entries(soldiersByColor || {}).map(([color, soldiers = []]) => {
    const completed = soldiers.filter((soldier) => soldier.isOut === true).length;
    return {
      color,
      completed,
      isWinner: soldiers.length > 0 && soldiers.every((soldier) => soldier.isOut === true),
    };
  });

  const winner = results.find((player) => player.isWinner);
  if (!winner) return null;

  return {
    winningColor: winner.color,
    winnerResults: [...results].sort((a, b) => b.completed - a.completed).slice(0, 3),
  };
};