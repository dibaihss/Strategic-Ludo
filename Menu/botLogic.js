import { handleEnterNewSoldierCore, movePlayerCore, sendMoveUpdateCore } from '../GameComponents/Bases.logic';
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
  randomFn,
  disableNoise = false,
}) => {
  const action = chooseBotAction(cardsByColor, soldiersByColor, color, {
    difficulty,
    randomFn,
    disableNoise,
  });
  if (botTimeout) {
    clearTimeout(botTimeout);
  }
  const { selectedPlayer, moveMessage } = buildBotMultiplayerMessages(action);

  if (connected && currentMatch?.id && selectedPlayer) {
    sendMessage(`/app/player.getPlayer/${currentMatch.id}`, selectedPlayer);
  }

  if (moveMessage) {
      // Clear previous pending bot action
  
      botTimeout = setTimeout(() => {
      console.log("Bot action:", action); // Debugging line
      sendMoveUpdateCore({
        connected,
        message: moveMessage,
        sendMatchCommand,
        currentMatch,
        user,
        sendMessage,
      });
    } , 1500); // Simulate thinking time
  }
  
  return action;
};

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
