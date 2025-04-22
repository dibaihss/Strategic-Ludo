import { createSlice } from '@reduxjs/toolkit';
import { errorMsgs, gameInstructions } from '../shared/hardCodedData';


const initialState = {
    systemLang: "en",
    gameInstructions,
    errorMsgs
};

const languageSlice = createSlice({
    name: 'language',
    initialState,
    reducers: {
        setSystemLanguage: (state, action) => {
            state.systemLang = action.payload;
        },
    }
});
export const { 
  setSystemLanguage
} = languageSlice.actions;

export default languageSlice.reducer;

