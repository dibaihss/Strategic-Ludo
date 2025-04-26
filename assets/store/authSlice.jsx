import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = 'http://localhost:8080/api';

// Simplified login thunk
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (username, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: username, status: 'active' }),
      });

      if (!response.ok) return rejectWithValue('Login failed');
      return await response.json();
    } catch (error) {
      return rejectWithValue('Network error');
    }
  }
);

// Fetch available matches
export const fetchMatches = createAsyncThunk(
  'auth/fetchMatches',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/sessions`);
      if (!response.ok) return rejectWithValue('Failed to fetch matches');
      return await response.json();
    } catch (error) {
      return rejectWithValue('Network error');
    }
  }
);

// Create a new match
export const createMatch = createAsyncThunk(
  'auth/createMatch',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const userId = auth.user?.id;
      
      // Create match
      const response = await fetch(`${API_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Game Room ${Math.floor(Math.random() * 1000)}`,
          status: 'waiting'
        }),
      });
      
      if (!response.ok) return rejectWithValue('Failed to create match');
      const match = await response.json();
      
      // Join the match automatically
      if (userId) {
        await fetch(`${API_URL}/sessions/${match.id}/users/${userId}`, {
          method: 'POST'
        });
      }
      
      return match;
    } catch (error) {
      return rejectWithValue('Network error');
    }
  }
);

// Join an existing match
export const joinMatch = createAsyncThunk(
  'auth/joinMatch',
  async (matchId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const userId = auth.user?.id;
      
      if (!userId) return rejectWithValue('Not logged in');
      
      const response = await fetch(`${API_URL}/sessions/${matchId}/users/${userId}`, {
        method: 'POST'
      });
      
      if (!response.ok) return rejectWithValue('Failed to join match');
      
      // Get updated match data
      const matchResponse = await fetch(`${API_URL}/sessions/${matchId}`);
      return await matchResponse.json();
    } catch (error) {
      return rejectWithValue('Network error');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isLoggedIn: false,
    user: null,
    error: null,
    matches: [],
    currentMatch: null,
    loading: false
  },
  reducers: {
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.currentMatch = null;
    },
    updateMatch: (state, action) => {
      // Update match data (e.g., from WebSocket)
      const index = state.matches.findIndex(m => m.id === action.payload.id);
      if (index !== -1) {
        state.matches[index] = action.payload;
      } else {
        state.matches.push(action.payload);
      }
      
      // Update currentMatch if it's the same
      if (state.currentMatch?.id === action.payload.id) {
        state.currentMatch = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch matches
      .addCase(fetchMatches.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.matches = action.payload;
      })
      .addCase(fetchMatches.rejected, (state) => {
        state.loading = false;
      })
      
      // Create match
      .addCase(createMatch.pending, (state) => {
        state.loading = true;
      })
      .addCase(createMatch.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMatch = action.payload;
        state.matches.push(action.payload);
      })
      .addCase(createMatch.rejected, (state) => {
        state.loading = false;
      })
      
      // Join match
      .addCase(joinMatch.pending, (state) => {
        state.loading = true;
      })
      .addCase(joinMatch.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMatch = action.payload;
        const index = state.matches.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.matches[index] = action.payload;
        }
      })
      .addCase(joinMatch.rejected, (state) => {
        state.loading = false;
      });
  }
});

export const { logout, updateMatch } = authSlice.actions;

// Simple selectors
export const selectUser = (state) => state.auth.user;
export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;
export const selectMatches = (state) => state.auth.matches;
export const selectCurrentMatch = (state) => state.auth.currentMatch;

export default authSlice.reducer;