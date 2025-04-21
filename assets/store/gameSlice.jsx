import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { playerType } from "../shared/hardCodedData.js";
// import { useDispatch, useSelector } from 'react-redux';

import { setBoxesPosition, setShowClone } from './animationSlice.jsx'

// const showClone = useSelector(state => state.animation.showClone)

const initialState = {
    currentPlayer: null,
    activePlayer: "blue",
    timeRemaining: 35,
    isTimerRunning: false,
    blueSoldiers: [
        { id: 1, position: '1d', color: "blue", initialPosition: '1blue', onBoard: true, isOut: false },
        { id: 2, position: '2blue', color: "blue", initialPosition: '2blue', onBoard: false, isOut: false },
        { id: 3, position: '3blue', color: "blue", initialPosition: '3blue', onBoard: false, isOut: false },
        { id: 4, position: '4blue', color: "blue", initialPosition: '4blue', onBoard: false, isOut: false }
    ],
    redSoldiers: [
        { id: 5, position: '1a', color: "red", initialPosition: '1red', onBoard: true, isOut: false },
        { id: 6, position: '2red', color: "red", initialPosition: '2red', onBoard: false, isOut: false },
        { id: 7, position: '3red', color: "red", initialPosition: '3red', onBoard: false, isOut: false },
        { id: 8, position: '4red', color: "red", initialPosition: '4red', onBoard: false, isOut: false }
    ],
    yellowSoldiers: [
        { id: 9, position: '1c', color: "yellow", initialPosition: '1yellow', onBoard: true, isOut: false },
        { id: 10, position: '2yellow', color: "yellow", initialPosition: '2yellow', onBoard: false, isOut: false },
        { id: 11, position: '3yellow', color: "yellow", initialPosition: '3yellow', onBoard: false, isOut: false },
        { id: 12, position: '4yellow', color: "yellow", initialPosition: '4yellow', onBoard: false, isOut: false }
    ],
    greenSoldiers: [
        { id: 13, position: '1d', color: "green", initialPosition: '1green', onBoard: true, isOut: false },
        { id: 14, position: '2green', color: "green", initialPosition: '2green', onBoard: false, isOut: false },
        { id: 15, position: '3green', color: "green", initialPosition: '3green', onBoard: false, isOut: false },
        { id: 16, position: '4green', color: "green", initialPosition: '4green', onBoard: false, isOut: false }
    ],
    blueCards: [
        { id: 1, used: false, value: 1 },
        { id: 2, used: false, value: 2 },
        { id: 3, used: false, value: 3 },
        { id: 4, used: false, value: 4 },
        { id: 5, used: false, value: 5 },
        { id: 6, used: false, value: 6 }
    ],
    redCards: [
        { id: 7, used: false, value: 1 },
        { id: 8, used: false, value: 2 },
        { id: 9, used: false, value: 3 },
        { id: 10, used: false, value: 4 },
        { id: 11, used: false, value: 5 },
        { id: 12, used: false, value: 6 }
    ],
    yellowCards: [
        { id: 13, used: false, value: 1 },
        { id: 14, used: false, value: 2 },
        { id: 15, used: false, value: 3 },
        { id: 16, used: false, value: 4 },
        { id: 17, used: false, value: 5 },
        { id: 18, used: false, value: 6 }
    ],
    greenCards: [
        { id: 19, used: false, value: 1 },
        { id: 20, used: false, value: 2 },
        { id: 21, used: false, value: 3 },
        { id: 22, used: false, value: 4 },
        { id: 23, used: false, value: 5 },
        { id: 24, used: false, value: 6 }
    ]
};
const getNextPlayerType = (currentPlayerType) => {
    const currentIndex = playerType.indexOf(currentPlayerType);
    const nextIndex = (currentIndex + 1) % playerType.length;
    return playerType[nextIndex];
};


export const checkIfGotEnemy = ({ color, position }) => (dispatch, getState) => {
    // if (!position) return;

    const state = getState().game;
    let enemyInPosition;

    switch (color) {
        case 'blue':
            enemyInPosition = [...state.redSoldiers, ...state.yellowSoldiers, ...state.greenSoldiers]
                .find(soldier => soldier.position === position);
            break;
        case 'red':
            enemyInPosition = [...state.blueSoldiers, ...state.yellowSoldiers, ...state.greenSoldiers]
                .find(soldier => soldier.position === position);
            break;
        case 'yellow':
            enemyInPosition = [...state.redSoldiers, ...state.blueSoldiers, ...state.greenSoldiers]
                .find(soldier => soldier.position === position);
            break;
        case 'green':
            enemyInPosition = [...state.redSoldiers, ...state.yellowSoldiers, ...state.blueSoldiers]
                .find(soldier => soldier.position === position);
            break;
    }

    if (enemyInPosition) {
        dispatch(setCurrentPlayer(enemyInPosition));
        console.log(enemyInPosition)
        dispatch(setBoxesPosition({ ySteps: 3, xSteps: 3, returenToBase: true, kickedPlayer: enemyInPosition }))
    } else {
        dispatch(setActivePlayer());
        dispatch(resetTimer());
    }
};


export const checkIfCardUsed = ({ color, steps }) => (dispatch, getState) => {
    const state = getState().game;
    const cardsByColor = {
        blue: { cards: state.blueCards, updateAction: updateBlueCards },
        red: { cards: state.redCards, updateAction: updateRedCards },
        yellow: { cards: state.yellowCards, updateAction: updateYellowCards },
        green: { cards: state.greenCards, updateAction: updateGreenCards }
    };

    const { cards, updateAction } = cardsByColor[color];

    // Check if only one card is unused
    const unusedCards = cards.filter(card => !card.used);
    if (unusedCards.length === 1) {
        dispatch(updateAction({ used: false, value: 0, updateAll: true }));
        return false;
    }

    // Check if card with given steps is already used
    const card = cards.find(card => card.value === steps);
    if (card?.used) {
        return true;
    }
    // Mark card as used
    dispatch(updateAction({ used: true, value: steps }));
    return false;
};

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        setCurrentPlayer: (state, action) => {
            state.currentPlayer = action.payload;
        },
        setActivePlayer: (state, action) => {
            const newActivePlayer = getNextPlayerType(state.activePlayer);
            state.activePlayer = newActivePlayer;

            // Set currentPlayer to the first non-out soldier of the new active player
            const soldiers = {
                blue: state.blueSoldiers,
                red: state.redSoldiers,
                yellow: state.yellowSoldiers,
                green: state.greenSoldiers
            }[newActivePlayer];

            const firstAvailableSoldier = soldiers.find(soldier => !soldier.isOut && soldier.onBoard);
            if (firstAvailableSoldier) {
                state.currentPlayer = firstAvailableSoldier;
            }
        },
        updateBlueCards: (state, action) => {
            const { used, value, updateAll } = action.payload;
            if (updateAll) {
                state.blueCards = state.blueCards.map(card => ({ ...card, used }));
            } else {
                state.blueCards = state.blueCards.map(card =>
                    card.value === value ? { ...card, used } : card
                );
            }
        },

        updateRedCards: (state, action) => {
            const { used, value, updateAll } = action.payload;
            if (updateAll) {
                state.redCards = state.redCards.map(card => ({ ...card, used }));
            } else {
                state.redCards = state.redCards.map(card =>
                    card.value === value ? { ...card, used } : card
                );
            }
        },

        updateYellowCards: (state, action) => {
            const { used, value, updateAll } = action.payload;
            if (updateAll) {
                state.yellowCards = state.yellowCards.map(card => ({ ...card, used }));
            } else {
                state.yellowCards = state.yellowCards.map(card =>
                    card.value === value ? { ...card, used } : card
                );
            }
        },

        updateGreenCards: (state, action) => {
            const { used, value, updateAll } = action.payload;
            if (updateAll) {
                state.greenCards = state.greenCards.map(card => ({ ...card, used }));
            } else {
                state.greenCards = state.greenCards.map(card =>
                    card.value === value ? { ...card, used } : card
                );
            }
        },
        moveSoldier: (state, action) => {
            const { color, position, soldierID, returenToBase } = action.payload;
            const soldiersByColor = {
                blue: state.blueSoldiers,
                red: state.redSoldiers,
                yellow: state.yellowSoldiers,
                green: state.greenSoldiers
            };

            console.log(position)
            const updatedSoldiers = soldiersByColor[color].map(soldier =>
                soldier.id === soldierID
                    ? returenToBase
                        ? { ...soldier, position: soldier.initialPosition, onBoard: false, isOut: false }
                        : !position
                            ? { ...soldier, position, onBoard: false, isOut: true }
                            : { ...soldier, position }
                    : soldier
            );

            switch (color) {
                case 'blue':
                    state.blueSoldiers = updatedSoldiers;
                    break;
                case 'red':
                    state.redSoldiers = updatedSoldiers;
                    break;
                case 'yellow':
                    state.yellowSoldiers = updatedSoldiers;
                    break;
                case 'green':
                    state.greenSoldiers = updatedSoldiers;
                    break;
            }
        },
        enterNewSoldier: (state, action) => {
            const { color } = action.payload;
            if (color === 'blue') {
                const soldier = state.blueSoldiers.find(s => !s.onBoard && !s.isOut);
                if (soldier) {
                    state.blueSoldiers = state.blueSoldiers.map(s =>
                        s.id === soldier.id ? { ...s, position: '1a', onBoard: true } : s
                    );
                }
            } else if (color === 'red') {
                const soldier = state.redSoldiers.find(s => !s.onBoard && !s.isOut);
                if (soldier) {
                    state.redSoldiers = state.redSoldiers.map(s =>
                        s.id === soldier.id ? { ...s, position: '1b', onBoard: true } : s
                    );
                }
            }
            else if (color === 'yellow') {
                const soldier = state.yellowSoldiers.find(s => !s.onBoard && !s.isOut);
                if (soldier) {
                    state.yellowSoldiers = state.yellowSoldiers.map(s =>
                        s.id === soldier.id ? { ...s, position: '1c', onBoard: true } : s
                    );
                }
            } else if (color === 'green') {
                const soldier = state.greenSoldiers.find(s => !s.onBoard && !s.isOut);
                if (soldier) {
                    state.greenSoldiers = state.greenSoldiers.map(s =>
                        s.id === soldier.id ? { ...s, position: '1d', onBoard: true } : s
                    );
                }
            }
        },

        updateTimer: (state, action) => {
            state.timeRemaining = action.payload;
        },
        setTimerRunning: (state, action) => {
            state.isTimerRunning = action.payload;
        },
        resetTimer: (state) => {
            state.timeRemaining = 35;
        }
    }
});

export const {
    setCurrentPlayer,
    setActivePlayer,
    moveSoldier,
    enterNewSoldier,
    updateBlueCards,
    updateRedCards,
    updateYellowCards,
    updateGreenCards,
    updateTimer,
    setTimerRunning,
    resetTimer
} = gameSlice.actions;

export default gameSlice.reducer;