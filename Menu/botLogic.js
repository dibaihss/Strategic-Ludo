import { handleEnterNewSoldierCore, movePlayerCore } from '../GameComponents/Bases.logic';
import { resetTimer, setActivePlayer, setCurrentPlayer } from '../assets/store/gameSlice.jsx';

export const getCardsForColor = (cardsByColor, color) => cardsByColor[color] || [];

export const getSoldiersForColor = (soldiersByColor, color) => soldiersByColor[color] || [];

export const getFirstAvailableBotPlayer = (soldiersByColor, color) => {
  const soldiers = getSoldiersForColor(soldiersByColor, color);

  return soldiers.find((soldier) => soldier.onBoard && !soldier.isOut)
    || soldiers.find((soldier) => !soldier.onBoard && !soldier.isOut)
    || null;
};

export const chooseBotAction = (cardsByColor, soldiersByColor, color) => {
  const cards = getCardsForColor(cardsByColor, color).filter((card) => !card.used);
  const soldiers = getSoldiersForColor(soldiersByColor, color);
  const onBoardSoldiers = soldiers.filter((soldier) => soldier.onBoard && !soldier.isOut);

  if (onBoardSoldiers.length > 0 && cards.length > 0) {
    return { type: 'movePlayer', payload: { color, steps: cards[0].value } };
  }

  const offBoardSoldier = soldiers.find((soldier) => !soldier.onBoard && !soldier.isOut);
  if (offBoardSoldier) {
    return { type: 'enterNewSoldier', payload: { color } };
  }

  return { type: 'skipTurn', payload: {} };
};

export const runBotTurn = ({
  color,
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
}) => {
  const botPlayer = getFirstAvailableBotPlayer(soldiersByColor, color);
  const action = chooseBotAction(cardsByColor, soldiersByColor, color);

  if (botPlayer && botPlayer.color === color) {
    dispatch(setCurrentPlayerAction(botPlayer));
  }

  if (action.type === 'movePlayer') {
    movePlayer({
      color,
      steps: action.payload.steps,
      currentPlayer: botPlayer,
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
