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
    statetest: { count: 0, name: "John" }
};


export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        setState: (state, action) => {
            state.statetest = action.payload;
        },
        setCurrentPlayer: (state, action) => {
            state.currentPlayer = action.payload;
        },
        updateBlueSoldiers: (state, action) => {
            state.blueSoldiers = action.payload;
        },
        updateRedSoldiers: (state, action) => {
            state.redSoldiers = action.payload;
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
    setState,
    setCurrentPlayer, 
    updateBlueSoldiers, 
    updateRedSoldiers,
    moveSoldier,
    enterNewSoldier 
} = gameSlice.actions;

export default gameSlice.reducer;