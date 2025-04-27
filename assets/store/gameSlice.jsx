import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { playerType } from "../shared/hardCodedData.js";

import { startingPositions } from "../shared/hardCodedData.js";
import { setBoxesPosition } from './animationSlice.jsx'


const initialState = {
    currentPlayer: null,
    activePlayer: "blue",
    onlineModus: false,
    timeRemaining: 35,
    isTimerRunning: false,
    playerAssignments: {
        blue: null,
        red: null,
        yellow: null,
        green: null
    },
    blueSoldiers: [
        { id: 1, position: '1a', color: "blue", initialPosition: '1blue', onBoard: true, isOut: false},
        { id: 2, position: '2blue', color: "blue", initialPosition: '2blue', onBoard: false, isOut: false},
        { id: 3, position: '3blue', color: "blue", initialPosition: '3blue', onBoard: false, isOut: false},
        { id: 4, position: '4blue', color: "blue", initialPosition: '4blue', onBoard: false, isOut: false}
    ],
    redSoldiers: [
        { id: 5, position: '1b', color: "red", initialPosition: '1red', onBoard: true, isOut: false},
        { id: 6, position: '2red', color: "red", initialPosition: '2red', onBoard: false, isOut: false},
        { id: 7, position: '3red', color: "red", initialPosition: '3red', onBoard: false, isOut: false},
        { id: 8, position: '4red', color: "red", initialPosition: '4red', onBoard: false, isOut: false}
    ],
    yellowSoldiers: [
        { id: 9, position: '1c', color: "yellow", initialPosition: '1yellow', onBoard: true, isOut: false},
        { id: 10, position: '2yellow', color: "yellow", initialPosition: '2yellow', onBoard: false, isOut: false},
        { id: 11, position: '3yellow', color: "yellow", initialPosition: '3yellow', onBoard: false, isOut: false},
        { id: 12, position: '4yellow', color: "yellow", initialPosition: '4yellow', onBoard: false, isOut: false}
    ],
    greenSoldiers: [
        { id: 13, position: '1d', color: "green", initialPosition: '1green', onBoard: true, isOut: false},
        { id: 14, position: '2green', color: "green", initialPosition: '2green', onBoard: false, isOut: false},
        { id: 15, position: '3green', color: "green", initialPosition: '3green', onBoard: false, isOut: false},
        { id: 16, position: '4green', color: "green", initialPosition: '4green', onBoard: false, isOut: false}
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

    if (enemyInPosition && position) {
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
export const enterNewSoldier = (color) => (dispatch, getState) => {

    const state = getState().game;

    const soldiers = {
        blue: state.blueSoldiers,
        red: state.redSoldiers,
        yellow: state.yellowSoldiers,
        green: state.greenSoldiers
    }[color];


    const soldier = soldiers.find(s => !s.onBoard && !s.isOut);
    if (soldier) {
        dispatch(moveSoldier({
            color: soldier.color,
            position: startingPositions[color],
            soldierID: soldier.id,
            onBoard: true
        }));
        checkIfGotEnemy({ color: soldier.color, position: startingPositions[color] })(dispatch, getState);
    } else {
        console.log("No available soldiers to enter the board.");
    }
};

export const canUserMoveSoldier = createAsyncThunk(
    'game/canUserMoveSoldier',
    async ({ userId, soldierId }, { getState }) => {
        const state = getState().game;
        
        // Check all soldier arrays
        const allSoldiers = [
            ...state.blueSoldiers,
            ...state.redSoldiers,
            ...state.yellowSoldiers,
            ...state.greenSoldiers
        ];
        
        // Find the soldier
        const soldier = allSoldiers.find(s => s.id === soldierId);
        
        // Check if the soldier belongs to the user and it's their turn
        const canMove = soldier && 
                        soldier.user_id === userId && 
                        soldier.color === state.activePlayer;
        
        return { 
            canMove,
            soldier: soldier || null
        };
    }
);
// New thunk to sync game state with server (for multiplayer)
export const syncGameWithServer = createAsyncThunk(
    'game/syncWithServer',
    async (gameData, { dispatch }) => {
        // Set the active player
        if (gameData.activePlayer) {
            dispatch(setActivePlayerDirect(gameData.activePlayer));
        }
        
        // Update soldiers positions if provided
        if (gameData.soldiers) {
            dispatch(updateAllSoldiers(gameData.soldiers));
        }
        
        // Update card states if provided
        if (gameData.cards) {
            dispatch(updateAllCards(gameData.cards));
        }
        
        return gameData;
    }
);

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
            const { color, position, soldierID, returenToBase, onBoard } = action.payload;
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
                            ? { ...soldier, position, onBoard: false, isOut: true } :
                            onBoard ? {
                                ...soldier,
                                position: position,  // Update position to the new one
                                onBoard: true, isOut: false
                            } : { ...soldier, position }
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


        updateTimer: (state, action) => {
            state.timeRemaining = action.payload;
        },
        setTimerRunning: (state, action) => {
            state.isTimerRunning = action.payload;
        },
        resetTimer: (state) => {
            state.timeRemaining = 35;
        },
        setOnlineModus: (state, action) => {
            state.onlineModus = action.payload;
        },
 ////////////////////////////////////////////////////////////////////////////////////
        setAssignOwner: (state, action) => {
            // action.payload should be an array of { userId, color } objects
            const assignments = action.payload;
            
            if (!Array.isArray(assignments)) return;
            
            // Reset the assignOwner array
            state.playerAssignments = [
                {user_id: null, color: null},
                {user_id: null, color: null},
                {user_id: null, color: null},
                {user_id: null, color: null}
            ];
            
            // Update with new assignments
            assignments.forEach((assignment, index) => {
                if (index < 4) { // Make sure we don't exceed array bounds
                    state.playerAssignments[index] = {
                        user_id: assignment.userId,
                        color: assignment.color
                    };
                }
            });
        },
        
        setSoldierUserIds: (state, action) => {
            const { color, userId } = action.payload;
            
            // Update all soldiers of the given color with the user ID
            switch (color) {
                case 'blue':
                    state.blueSoldiers = state.blueSoldiers.map(soldier => ({
                        ...soldier,
                        user_id: userId
                    }));
                    break;
                case 'red':
                    state.redSoldiers = state.redSoldiers.map(soldier => ({
                        ...soldier,
                        user_id: userId
                    }));
                    break;
                case 'yellow':
                    state.yellowSoldiers = state.yellowSoldiers.map(soldier => ({
                        ...soldier,
                        user_id: userId
                    }));
                    break;
                case 'green':
                    state.greenSoldiers = state.greenSoldiers.map(soldier => ({
                        ...soldier,
                        user_id: userId
                    }));
                    break;
            }
        },
        
        setActivePlayerDirect: (state, action) => {
            // Directly set the active player without cycling
            state.activePlayer = action.payload;
        },
        
        updateAllSoldiers: (state, action) => {
            // action.payload should be an object with color keys and arrays of soldier objects
            const { blue, red, yellow, green } = action.payload;
            
            if (blue && Array.isArray(blue)) {
                state.blueSoldiers = blue.map((s, i) => ({
                    ...state.blueSoldiers[i],
                    ...s
                }));
            }
            
            if (red && Array.isArray(red)) {
                state.redSoldiers = red.map((s, i) => ({
                    ...state.redSoldiers[i],
                    ...s
                }));
            }
            
            if (yellow && Array.isArray(yellow)) {
                state.yellowSoldiers = yellow.map((s, i) => ({
                    ...state.yellowSoldiers[i],
                    ...s
                }));
            }
            
            if (green && Array.isArray(green)) {
                state.greenSoldiers = green.map((s, i) => ({
                    ...state.greenSoldiers[i],
                    ...s
                }));
            }
        },
        
        updateAllCards: (state, action) => {
            // action.payload should be an object with color keys and arrays of card objects
            const { blue, red, yellow, green } = action.payload;
            
            if (blue && Array.isArray(blue)) {
                state.blueCards = blue.map((c, i) => ({
                    ...state.blueCards[i],
                    ...c
                }));
            }
            
            if (red && Array.isArray(red)) {
                state.redCards = red.map((c, i) => ({
                    ...state.redCards[i],
                    ...c
                }));
            }
            
            if (yellow && Array.isArray(yellow)) {
                state.yellowCards = yellow.map((c, i) => ({
                    ...state.yellowCards[i],
                    ...c
                }));
            }
            
            if (green && Array.isArray(green)) {
                state.greenCards = green.map((c, i) => ({
                    ...state.greenCards[i],
                    ...c
                }));
            }
        },
        
        resetSoldierUserIds: (state) => {
            // Reset all user_id values to null for soldiers
            state.blueSoldiers = state.blueSoldiers.map(soldier => ({
                ...soldier,
                user_id: null
            }));
            state.redSoldiers = state.redSoldiers.map(soldier => ({
                ...soldier,
                user_id: null
            }));
            state.yellowSoldiers = state.yellowSoldiers.map(soldier => ({
                ...soldier,
                user_id: null
            }));
            state.greenSoldiers = state.greenSoldiers.map(soldier => ({
                ...soldier,
                user_id: null
            }));
            
            // Also reset the assignOwner array
            state.assignOwner = [
                {user_id: null, color: null},
                {user_id: null, color: null},
                {user_id: null, color: null},
                {user_id: null, color: null}
            ];
        },
        
        // Add a reset game state function for when a game ends or is abandoned
        resetGameState: (state) => {
            return {
                ...initialState,
                onlineModus: state.onlineModus // Preserve online mode status
            };
        }

    }
});

export const {
    setCurrentPlayer,
    setActivePlayer,
    moveSoldier,
    setOnlineModus,
    updateBlueCards,
    updateRedCards,
    updateYellowCards,
    updateGreenCards,
    updateTimer,
    setTimerRunning,
    resetTimer,
    setSoldierUserIds,  // Add these new exports
    resetSoldierUserIds,
    setAssignOwner, // New
    updateAllSoldiers, // New
    updateAllCards, // New
    resetGameState, // New
    setActivePlayerDirect, // New
} = gameSlice.actions;

export default gameSlice.reducer;