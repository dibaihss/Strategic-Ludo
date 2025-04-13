import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentPlayer: null,
    blueSoldiers: [
        { id: 1, position: '1a', color: "blue", initialPosition: '1a', onBoard: true, isOut: false },
        { id: 2, position: '2blue', color: "blue", initialPosition: '2blue', onBoard: false, isOut: false },
        { id: 3, position: '3blue', color: "blue", initialPosition: '3blue', onBoard: false, isOut: false },
        { id: 4, position: '4blue', color: "blue", initialPosition: '4blue', onBoard: false, isOut: false }
    ],
    redSoldiers: [
        { id: 5, position: '1b', color: "red", initialPosition: '1b', onBoard: true, isOut: false },
        { id: 6, position: '2red', color: "red", initialPosition: '2red', onBoard: false, isOut: false },
        { id: 7, position: '3red', color: "red", initialPosition: '3red', onBoard: false, isOut: false },
        { id: 8, position: '4red', color: "red", initialPosition: '4red', onBoard: false, isOut: false }
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
};



export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        setCurrentPlayer: (state, action) => {
            state.currentPlayer = action.payload;
        },
        updateBlueSoldiers: (state, action) => {
            state.blueSoldiers = action.payload;
        },
        updateBlueCards: (state, action) => {
            const { used , value, updateAll } = action.payload;
            if(updateAll){
                state.blueCards = state.blueCards.map(card => ({ ...card, used }));
            }else{
                state.blueCards = state.blueCards.map(card => 
                    card.value === value ? { ...card, used } : card
                );
            }
        },
        
        updateRedCards: (state, action) => {
            const { used , value, updateAll } = action.payload;
            if(updateAll){
                state.redCards = state.redCards.map(card => ({ ...card, used }));
            }else{
            state.redCards = state.redCards.map(card => 
                card.value === value ? { ...card, used } : card
            );
        }
        },
        moveSoldier: (state, action) => {
            const { color, position, soldierID } = action.payload;
            console.log("moveSoldier", color, position, soldierID);
            if (color === 'blue') {
                if(!position){
                    state.blueSoldiers = state.blueSoldiers.map(soldier => 
                        soldier.id === soldierID ? { ...soldier, position, onBoard: false, isOut: true } : soldier
                    );
                }else{
                    state.blueSoldiers = state.blueSoldiers.map(soldier => 
                        soldier.id === soldierID ? { ...soldier, position } : soldier
                    );
                }
                
            } else if (color === 'red') {
                if(!position){
                    state.redSoldiers = state.redSoldiers.map(soldier => 
                        soldier.id === soldierID ? { ...soldier, position, onBoard: false, isOut: true } : soldier
                    );
                }else{
                state.redSoldiers = state.redSoldiers.map(soldier => 
                    soldier.id === soldierID ? { ...soldier, position } : soldier
                );
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
        }
    }
});

export const { 
    setCurrentPlayer, 
    updateBlueSoldiers, 
    updateRedSoldiers,
    moveSoldier,
    enterNewSoldier,
    updateBlueCards,
    updateRedCards
} = gameSlice.actions;

export default gameSlice.reducer;