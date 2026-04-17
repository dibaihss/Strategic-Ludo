import { enterNewSoldier, checkIfCardUsed } from '../assets/store/gameSlice.jsx';
import { setBoxesPosition } from '../assets/store/animationSlice.jsx';
import { boxes, categories } from '../assets/shared/hardCodedData.js';

export const getCategoryFromPosition = (position) => position.match(/[a-zA-Z]+/)[0];

export const getNumberFromPosition = (position) => parseInt(position.match(/\d+/)[0], 10);

export const canControlColor = (currentPlayerColor, color) => {
    console.log('currentPlayerColor', currentPlayerColor, color);
    if (currentPlayerColor === color) return true;
    if (Array.isArray(currentPlayerColor)) {
        return currentPlayerColor[0] === color || currentPlayerColor[1] === color;
    }
    return false;
};

export const canEnterPiece = (activePlayer, color, currentPlayerColor) => {
    console.log('canEnterPiece', activePlayer, color, currentPlayerColor);
    if (activePlayer === color && currentPlayerColor === color 
        || activePlayer === color && currentPlayerColor[0] === color  
        || activePlayer === color && currentPlayerColor[1] === color 
        || activePlayer === currentPlayerColor  
        || activePlayer === currentPlayerColor[1]   
        || activePlayer === currentPlayerColor[0]) return true;
}

export const getNextCategory = (currentCategory) => {
    const currentIndex = categories.indexOf(currentCategory);
    const nextIndex = (currentIndex + 1) % categories.length;
    return categories[nextIndex];
};

export const getInvolvedSteps = (band, sourcePos, targetPos) => {
    const targetCategory = getCategoryFromPosition(targetPos);
    const sourceCategory = getCategoryFromPosition(sourcePos);

    if (targetCategory === getNextCategory(sourceCategory)) {
        const maxBandNumber = Math.max(...band.map((item) => getNumberFromPosition(item)));
        return band.filter((box) => {
            const boxCategory = getCategoryFromPosition(box);
            if (boxCategory === targetCategory) {
                return getNumberFromPosition(box) <= getNumberFromPosition(targetPos);
            }
            if (boxCategory === sourceCategory) {
                return (
                    getNumberFromPosition(box) <= maxBandNumber &&
                    getNumberFromPosition(box) >= getNumberFromPosition(sourcePos)
                );
            }
            return false;
        });
    }

    return band.filter((box) => {
        const boxCategory = getCategoryFromPosition(box);
        if (boxCategory !== sourceCategory && boxCategory !== targetCategory) return false;
        return (
            getNumberFromPosition(box) <= getNumberFromPosition(targetPos) &&
            getNumberFromPosition(box) > getNumberFromPosition(sourcePos)
        );
    });
};

export const getMaxPositionNumber = (positions) => {
    if (!positions.length) return 0;
    return Math.max(...positions.map((item) => getNumberFromPosition(item)));
};

export const createStepMetrics = (sourcePos, targetPos) => {
    const row2 = getInvolvedSteps(boxes.row2, sourcePos, targetPos);
    const row1 = getInvolvedSteps(boxes.row1, sourcePos, targetPos);
    const column2 = getInvolvedSteps(boxes.column2, sourcePos, targetPos);
    const column1 = getInvolvedSteps(boxes.column1, sourcePos, targetPos);

    const metrics = {
        xSteps: 0,
        xSteps2: 0,
        ySteps: 0,
        ySteps2: 0,
        maxRow: 0,
        maxCol: 0,
        maxRow1: 0,
        maxRow2: 0,
        maxCol1: 0,
        maxCol2: 0,
    };

    if (row1.length > 0 && row2.length > 0) {
        metrics.maxRow1 = getMaxPositionNumber(row1);
        metrics.maxRow2 = getMaxPositionNumber(row2);
        const isFirstPathLarger = metrics.maxRow1 > metrics.maxRow2;
        const primary = isFirstPathLarger ? row1.length : row2.length;
        const secondary = isFirstPathLarger ? row2.length : row1.length;
        metrics.xSteps = primary;
        metrics.xSteps2 = secondary - 1;
        return metrics;
    }

    if (column1.length > 0 && column2.length > 0) {
        metrics.maxCol1 = getMaxPositionNumber(column1);
        metrics.maxCol2 = getMaxPositionNumber(column2);
        const isFirstPathLarger = metrics.maxCol1 > metrics.maxCol2;
        const primary = isFirstPathLarger ? column1.length : column2.length;
        const secondary = isFirstPathLarger ? column2.length : column1.length;
        metrics.ySteps = primary;
        metrics.ySteps2 = secondary - 1;
        return metrics;
    }

    metrics.xSteps = row1.length + row2.length;
    metrics.ySteps = column2.length + column1.length;
    metrics.maxRow = Math.max(getMaxPositionNumber(row1), getMaxPositionNumber(row2));
    metrics.maxCol = Math.max(getMaxPositionNumber(column1), getMaxPositionNumber(column2));
    return metrics;
};

export const isOutOfBoardPosition = (playerColor, position) => {
    const outPositions = {
        blue: '7d',
        red: '7a',
        yellow: '7b',
        green: '7c',
    };
    return outPositions[playerColor] === position;
};

export const calculateNewPositionForPlayer = (player, steps) => {
    if (!player.position || player.isOut) return undefined;

    let numbers = parseInt(player.position.match(/\d+/)[0], 10);
    let category = player.position.match(/[a-zA-Z]+/)[0];

    for (let i = 0; i < steps; i += 1) {
        numbers = numbers === 12 ? 1 : numbers + 1;
        category = numbers === 1 ? getNextCategory(category) : category;
        if (isOutOfBoardPosition(player.color, numbers + category)) {
            return '';
        }
    }

    return numbers + category;
};

export const getArrowNameByColor = (color) => {
    switch (color) {
        case 'red':
            return 'arrow-downward';
        case 'blue':
            return 'arrow-forward';
        case 'green':
            return 'arrow-downward';
        default:
            return 'arrow-forward-ios';
    }
};

export const sendMoveUpdateCore = ({ connected, message, sendMatchCommand, currentMatch, user, sendMessage }) => {
    if (!connected) return;

    if (message?.type) {
        sendMatchCommand({
            type: message.type,
            payload: message.payload || {},
            matchId: currentMatch?.id,
            playerId: user?.id,
        });
        return;
    }

    sendMessage(`/app/player.Move/${currentMatch.id}`, message);
};

export const handleEnterNewSoldierCore = ({ activePlayer, color, dispatch }) => {
    if (activePlayer !== color) {
        return { error: 'wrongTurn' };
    }

    dispatch(enterNewSoldier(color));
    return { error: null };
};

export const movePlayerCore = ({ color, steps, currentPlayer, activePlayer, showClone, dispatch }) => {
    if (!currentPlayer || currentPlayer.isOut) {
        return { error: 'selectPlayer' };
    }
     if (showClone) return { error: 'clone' };

    if (currentPlayer.color !== color) {
        return { error: 'wrongColor' };
    }

    if (activePlayer !== currentPlayer.color) {
        return { error: 'wrongTurn' };
    }

    dispatch(checkIfCardUsed({ color, steps }));
    const newPosition = calculateNewPositionForPlayer(currentPlayer, steps);

    if (newPosition === '') {
        const outOfBoardPayload =
            currentPlayer.color === 'red' || currentPlayer.color === 'green'
                ? { ySteps: steps, newPosition }
                : { xSteps: steps, newPosition };
        dispatch(setBoxesPosition(outOfBoardPayload));
        return { error: null };
    }

    const metrics = createStepMetrics(currentPlayer.position, newPosition);
    dispatch(setBoxesPosition({ ...metrics, newPosition }));
    return { error: null };
};
