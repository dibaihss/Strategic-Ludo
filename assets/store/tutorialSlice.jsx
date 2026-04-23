import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  active: false,
  currentStep: 0,
  completedOnce: false,
  dismissed: false,
  reopenRequested: false,
  anchorByStep: {},
  waitForBlueTurnReturn: false,
  pendingCaptureWithThree: false,
};

const reduceTutorialAction = (state, action) => {
  if (!state.active || !action?.payload?.type) {
    return;
  }

  const { type, value, activePlayer, color } = action.payload;

  if (state.currentStep === 0 && type === 'soldier_selected') {
    state.currentStep = 1;
    return;
  }

  if (state.currentStep === 1 && type === 'card_played' && Number(value) === 6) {
    state.currentStep = 2;
    state.waitForBlueTurnReturn = false;
    return;
  }

  if (state.currentStep === 2 && type === 'turn_changed') {
    if (activePlayer !== 'blue') {
      state.waitForBlueTurnReturn = true;
      return;
    }

    if (state.waitForBlueTurnReturn) {
      state.currentStep = 3;
      state.waitForBlueTurnReturn = false;
    }
    return;
  }

  if (state.currentStep === 3 && type === 'enter_soldier' && color === 'blue') {
    state.currentStep = 4;
    state.pendingCaptureWithThree = false;
    return;
  }

  if (state.currentStep === 4 && type === 'card_played' && Number(value) === 3 && color === 'blue') {
    state.pendingCaptureWithThree = true;
    return;
  }

  if (
    state.currentStep === 4
    && type === 'capture'
    && state.pendingCaptureWithThree
    && color === 'red'
    && action.payload?.actorColor === 'blue'
  ) {
    state.active = false;
    state.completedOnce = true;
    state.dismissed = false;
    state.reopenRequested = false;
    state.waitForBlueTurnReturn = false;
    state.pendingCaptureWithThree = false;
  }
};

const tutorialSlice = createSlice({
  name: 'tutorial',
  initialState,
  reducers: {
    startTutorial: (state) => {
      state.active = true;
      state.currentStep = 0;
      state.dismissed = false;
      state.reopenRequested = false;
      state.waitForBlueTurnReturn = false;
      state.pendingCaptureWithThree = false;
    },
    skipTutorial: (state) => {
      state.active = false;
      state.completedOnce = true;
      state.dismissed = true;
      state.reopenRequested = false;
      state.waitForBlueTurnReturn = false;
      state.pendingCaptureWithThree = false;
    },
    completeTutorial: (state) => {
      state.active = false;
      state.completedOnce = true;
      state.dismissed = false;
      state.reopenRequested = false;
      state.waitForBlueTurnReturn = false;
      state.pendingCaptureWithThree = false;
    },
    setCompletedOnce: (state, action) => {
      state.completedOnce = Boolean(action.payload);
    },
    setTutorialAnchor: (state, action) => {
      const step = Number(action.payload?.step);
      const anchor = action.payload?.anchor;
      if (!Number.isInteger(step) || step < 0 || !anchor) {
        return;
      }

      const previous = state.anchorByStep[step];
      if (
        previous
        && previous.x === anchor.x
        && previous.y === anchor.y
        && previous.width === anchor.width
        && previous.height === anchor.height
      ) {
        return;
      }

      state.anchorByStep[step] = anchor;
    },
    requestTutorialReopen: (state) => {
      state.reopenRequested = true;
    },
    clearTutorialReopen: (state) => {
      state.reopenRequested = false;
    },
    markTutorialAction: reduceTutorialAction,
  },
});

export const {
  startTutorial,
  skipTutorial,
  completeTutorial,
  setCompletedOnce,
  setTutorialAnchor,
  requestTutorialReopen,
  clearTutorialReopen,
  markTutorialAction,
} = tutorialSlice.actions;

export default tutorialSlice.reducer;
