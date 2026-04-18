import { handleEnterNewSoldierCore, movePlayerCore, sendMoveUpdateCore } from '../GameComponents/Bases.logic';
import { resetTimer, setActivePlayer, setCurrentPlayer } from '../assets/store/gameSlice.jsx';
import {
  chooseScoredBotAction,
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

export const buildBotMultiplayerMessages = (action) => {
  if (!action) {
    return {
      selectedPlayer: null,
      moveMessage: null,
    };
  }

  if (action.type === 'movePlayer') {
    return {
      selectedPlayer: action.payload?.soldier || null,
      moveMessage: {
        type: 'movePlayer',
        payload: {
          color: action.payload?.color,
          steps: action.payload?.steps,
        },
      },
    };
  }

  if (action.type === 'enterNewSoldier') {
    return {
      selectedPlayer: null,
      moveMessage: {
        type: 'enterNewSoldier',
        payload: {
          color: action.payload?.color,
        },
      },
    };
  }

  return {
    selectedPlayer: null,
    moveMessage: {
      type: 'skipTurn',
      payload: {},
    },
  };
};


let botTimeout = null;
export const cancelPendingBotTurn = () => {
  if (!botTimeout) return;

  clearTimeout(botTimeout);
  botTimeout = null;
};

export const emitMultiplayerBotTurn = ({
  color,
  difficulty = 'normal',
  cardsByColor,
  soldiersByColor,
  connected,
  currentMatch,
  user,
  sendMessage,
  sendMatchCommand,
  shouldCancel = () => false,
  delayMs = 1000,
  randomFn,
  disableNoise = false,
}) => {
  if (shouldCancel()) {
    cancelPendingBotTurn();
    return null;
  }

  const action = chooseBotAction(cardsByColor, soldiersByColor, color, {
    difficulty,
    randomFn,
    disableNoise,
  });
  cancelPendingBotTurn();

  const { selectedPlayer, moveMessage } = buildBotMultiplayerMessages(action);

  if (connected && currentMatch?.id && selectedPlayer) {
    sendMessage(`/app/player.getPlayer/${currentMatch.id}`, selectedPlayer);
  }

  const hasMultiplayerIdentity = Boolean(currentMatch?.id && user?.id);

  if (moveMessage && (!connected || hasMultiplayerIdentity)) {
    botTimeout = setTimeout(() => {
      if (shouldCancel()) {
        cancelPendingBotTurn();
        return;
      }

      sendMoveUpdateCore({
        connected,
        message: moveMessage,
        sendMatchCommand,
        currentMatch,
        user,
        sendMessage,
      });
      botTimeout = null;
    }, delayMs);
  }
  
  return action;
};

export const runBotTurn = async ({
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
  shouldCancel = () => false,
  delayMs = 500,
  randomFn,
  disableNoise = false,
}) => {
  // Simulate thinking time
  await new Promise(resolve => setTimeout(resolve, delayMs));

  if (shouldCancel()) {
    return null;
  }

  const action = chooseBotAction(cardsByColor, soldiersByColor, color, {
    difficulty,
    randomFn,
    disableNoise,
  });
  const botPlayer = action.payload?.soldier || getFirstAvailableBotPlayer(soldiersByColor, color);

  if (shouldCancel()) {
    return null;
  }

  if (botPlayer && botPlayer.color === color) {
    dispatch(setCurrentPlayerAction(botPlayer));
  }

  if (action.type === 'movePlayer' && botPlayer) {
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
