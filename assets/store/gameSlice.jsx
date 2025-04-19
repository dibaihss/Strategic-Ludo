import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentPlayer: null,
    blueSoldiers: [
        { id: 1, position: '10a', color: "blue", initialPosition: '1blue', onBoard: true, isOut: false },
        { id: 2, position: '2blue', color: "blue", initialPosition: '2blue', onBoard: false, isOut: false },
        { id: 3, position: '3blue', color: "blue", initialPosition: '3blue', onBoard: false, isOut: false },
        { id: 4, position: '4blue', color: "blue", initialPosition: '4blue', onBoard: false, isOut: false }
    ],
    redSoldiers: [
        { id: 5, position: '8b', color: "red", initialPosition: '1red', onBoard: true, isOut: false },
        { id: 6, position: '2red', color: "red", initialPosition: '2red', onBoard: false, isOut: false },
        { id: 7, position: '3red', color: "red", initialPosition: '3red', onBoard: false, isOut: false },
        { id: 8, position: '4red', color: "red", initialPosition: '4red', onBoard: false, isOut: false }
    ],
    yellowSoldiers: [
        { id: 9, position: '7c', color: "yellow", initialPosition: '1yellow', onBoard: true, isOut: false },
        { id: 10, position: '2yellow', color: "yellow", initialPosition: '2yellow', onBoard: false, isOut: false },
        { id: 11, position: '3yellow', color: "yellow", initialPosition: '3yellow', onBoard: false, isOut: false },
        { id: 12, position: '4yellow', color: "yellow", initialPosition: '4yellow', onBoard: false, isOut: false }
    ],
    greenSoldiers: [
        { id: 13, position: '10d', color: "green", initialPosition: '1green', onBoard: true, isOut: false },
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



export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {   
        setCurrentPlayer: (state, action) => {
            state.currentPlayer = action.payload;
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
            if (returenToBase) {
                if (color === 'blue') {
                    state.blueSoldiers = state.blueSoldiers.map(soldier =>
                        soldier.id === soldierID ? { ...soldier, position: soldier.initialPosition, onBoard: false, isOut: false } : soldier
                    );
                } else if (color === 'red') {
                    state.redSoldiers = state.redSoldiers.map(soldier =>
                        soldier.id === soldierID ? { ...soldier, position: soldier.initialPosition, onBoard: false, isOut: false } : soldier
                    );
                } else if (color === 'yellow') {
                state.yellowSoldiers = state.yellowSoldiers.map(soldier =>
                    soldier.id === soldierID ? { ...soldier, position: soldier.initialPosition, onBoard: false, isOut: false } : soldier
                );
            } else if (color === 'green') {
                state.greenSoldiers = state.greenSoldiers.map(soldier =>
                    soldier.id === soldierID ? { ...soldier, position: soldier.initialPosition, onBoard: false, isOut: false } : soldier
                );

            }}
             else {
                console.log("moveSoldier", color, position, soldierID);
                if (color === 'blue') {
                    if (!position) {
                        state.blueSoldiers = state.blueSoldiers.map(soldier =>
                            soldier.id === soldierID ? { ...soldier, position, onBoard: false, isOut: true } : soldier
                        );
                    } else {
                        state.blueSoldiers = state.blueSoldiers.map(soldier =>
                            soldier.id === soldierID ? { ...soldier, position } : soldier
                        );
                    }

                } else if (color === 'red') {
                    if (!position) {
                        state.redSoldiers = state.redSoldiers.map(soldier =>
                            soldier.id === soldierID ? { ...soldier, position, onBoard: false, isOut: true } : soldier
                        );
                    } else {
                        state.redSoldiers = state.redSoldiers.map(soldier =>
                            soldier.id === soldierID ? { ...soldier, position } : soldier
                        );
                    }
                }
                else if (color === 'yellow') {
                    if (!position) {
                        state.yellowSoldiers = state.yellowSoldiers.map(soldier =>
                            soldier.id === soldierID ? { ...soldier, position, onBoard: false, isOut: true } : soldier
                        );
                    } else {
                        state.yellowSoldiers = state.yellowSoldiers.map(soldier =>
                            soldier.id === soldierID ? { ...soldier, position } : soldier
                        );
                    }
                }
                else if (color === 'green') {
                    if (!position) {
                        state.greenSoldiers = state.greenSoldiers.map(soldier =>
                            soldier.id === soldierID ? { ...soldier, position, onBoard: false, isOut: true } : soldier
                        );
                    } else {
                        state.greenSoldiers = state.greenSoldiers.map(soldier =>
                            soldier.id === soldierID ? { ...soldier, position } : soldier
                        );
                    }
                }
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
        }
    }
});

export const {
    setCurrentPlayer,
    moveSoldier,
    enterNewSoldier,
    updateBlueCards,
    updateRedCards,
    updateYellowCards,
    updateGreenCards
} = gameSlice.actions;

export default gameSlice.reducer;