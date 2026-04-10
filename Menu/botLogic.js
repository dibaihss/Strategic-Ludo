import { handleEnterNewSoldierCore, movePlayerCore } from '../GameComponents/Bases.logic';
import { resetTimer, setActivePlayer, setCurrentPlayer } from '../assets/store/gameSlice.jsx';
import {
  chooseScoredBotAction,
  getCardsForColor,
  getSoldiersForColor,
  normalizeBotDifficulty,
} from './botStrategy.js';

export const getPlayerOwner = (users, playerColors, color) => {
  const ownerId = playerColors?.[color];
  if (!ownerId || !Array.isArray(users)) return null;

  return users.find((user) => String(user.id) === String(ownerId)) || null;
};

export const isBotControlledPlayer = (users, playerColors, color) =>
  Boolean(getPlayerOwner(users, playerColors, color)?.isBot);

export const getBotDifficultyForTurn = ({
  mode,
  routeBotDifficulty,
  users,
  playerColors,
  activePlayer,
}) => {
  if (mode === 'bot') {
    return normalizeBotDifficulty(routeBotDifficulty);
  }

  if (mode === 'multiplayer') {
    return normalizeBotDifficulty(getPlayerOwner(users, playerColors, activePlayer)?.botDifficulty);
  }

  return normalizeBotDifficulty();
};

export const getFirstAvailableBotPlayer = (soldiersByColor, color) => {
  const soldiers = getSoldiersForColor(soldiersByColor, color);

  return soldiers.find((soldier) => soldier.onBoard && !soldier.isOut)
    || soldiers.find((soldier) => !soldier.onBoard && !soldier.isOut)
    || null;
};

export const chooseBotAction = (cardsByColor, soldiersByColor, color, options = {}) =>
  chooseScoredBotAction({
    color,
    cardsByColor,
    soldiersByColor,
    difficulty: options.difficulty,
    randomFn: options.randomFn,
    disableNoise: options.disableNoise,
  });

export const runBotTurn = ({
  color,
  difficulty = 'normal',
  activePlayer,
  systemLang,
  showClone,
  dispatch,
  cardsByColor,
  soldiersByColor,
  movePlayer = movePlayerCore,
  enterNewSoldier = handleEnterNewSoldierCore,
  setCurrentPlayerAction = setCurrentPlayer,
  setActivePlayerAction = setActivePlayer,
  resetTimerAction = resetTimer,
  randomFn,
  disableNoise = false,
}) => {
  const action = chooseBotAction(cardsByColor, soldiersByColor, color, {
    difficulty,
    randomFn,
    disableNoise,
  });
  const botPlayer = action.payload?.soldier || getFirstAvailableBotPlayer(soldiersByColor, color);

  if (botPlayer && botPlayer.color === color) {
    dispatch(setCurrentPlayerAction(botPlayer));
  }

  if (action.type === 'movePlayer') {
    movePlayer({
      color,
      steps: action.payload.steps,
      currentPlayer: action.payload.soldier || botPlayer,
      activePlayer,
      systemLang,
      showClone,
      dispatch,
    });

    return action;
  }

  if (action.type === 'enterNewSoldier') {
    enterNewSoldier({ activePlayer: color, color, systemLang, dispatch });
    return action;
  }

  dispatch(setActivePlayerAction());
  dispatch(resetTimerAction());
  return action;
};
