import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native"; // Import Platform

// --- START: API URL Configuration ---
// Priority: 1) `process.env.REACT_APP_API_URL` 2) Expo `extra` config 3) platform-based defaults
let ExpoConstants = null;
try {
  ExpoConstants = require('expo-constants');
} catch (e) {
  ExpoConstants = null;
}

const ENV_API = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) ||
  (ExpoConstants && (ExpoConstants.manifest?.extra?.REACT_APP_API_URL || ExpoConstants.expoConfig?.extra?.REACT_APP_API_URL)) ||
  null;

const PRODUCTION_API_URL = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_PRODUCTION_URL) ||
  'https://lowcostbackendapp-dze4chctcsevdybb.westeurope-01.azurewebsites.net/api';

// URL options based on platform and environment
const LOCALHOST_API_URL =  process.env.EXPO_PUBLIC_LOCALHOST_API_URL || 'https://lowcostbackendapp-dze4chctcsevdybb.westeurope-01.azurewebsites.net/api';
const ANDROID_API_URL = 'http://192.168.178.130:8080/api'; // Android-specific URL with port

let API_URL = ENV_API || (__DEV__ ? (Platform.OS === 'android' ? ANDROID_API_URL : LOCALHOST_API_URL) : PRODUCTION_API_URL);

console.log(`Using API URL: ${API_URL} on platform: ${Platform.OS}`); // Enhanced logging
// --- END: API URL Configuration ---

const isE2EMode = (() => {
  const envFlag = (typeof process !== "undefined" && process?.env?.EXPO_PUBLIC_E2E === "true") ||
    (typeof process !== "undefined" && process?.env?.REACT_APP_E2E === "true");
  const queryFlag = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("e2e") === "1";
  return Boolean(envFlag || queryFlag);
})();

let e2eMatches = [
  {
    id: 5001,
    name: "E2E Match 5001",
    status: "waiting",
    users: [{ id: 9001, name: "E2E Host", isGuest: true }],
  },
];

const createE2EUser = () => ({
  id: 9002,
  name: "E2E Guest",
  email: "e2e.guest@example.com",
  isGuest: true,
});

const getE2EUser = async () => {
  const stored = await AsyncStorage.getItem("user");
  if (stored) return JSON.parse(stored);
  return createE2EUser();
};

const getAuthToken = async (getState) => {
  const stateToken = getState?.()?.auth?.token;
  if (stateToken) return stateToken;
  const storedToken = await AsyncStorage.getItem("token");
  return storedToken || null;
};

const requireAuthToken = async (getState, rejectWithValue, actionName) => {
  const token = await getAuthToken(getState);
  if (!token) {
    if (__DEV__) {
      console.warn(`[auth] Missing token for protected request: ${actionName}`);
    }
    return { error: rejectWithValue("Authentication required") };
  }
  return { token };
};
// Add this thunk after your other API calls
export const updateUserStatus = createAsyncThunk(
  "auth/updateUserStatus",
  async (status, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      let user = state.auth.user;
      const authResult = await requireAuthToken(getState, rejectWithValue, "updateUserStatus");
      if (authResult.error) return authResult.error;
      const { token } = authResult;

      console.log(`Updating user ${user.id} status to: ${status}`);

      // Make API request to update user status
      const response = await fetch(`${API_URL}/users/${user.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to update user status:", errorText);
        return rejectWithValue("Failed to update user status");
      }

      const updatedUser = await response.json();
      console.log("User status updated successfully:", updatedUser);
      return updatedUser;
    } catch (error) {
      console.error("Error updating user status:", error);
      return rejectWithValue("Network error while updating user status");
    }
  }
);

// Register user thunk
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userData.username,
          email: userData.email,
          password: userData.password,
          status: true,
        }),
      });

      if (!response.ok) return rejectWithValue("Registration failed");
      return await response.json();
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

// Load user from storage
export const loadStoredUser = createAsyncThunk(
  "auth/loadStoredUser",
  async (_, { rejectWithValue }) => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      const storedToken = await AsyncStorage.getItem("token");

      if (!storedUser) {
        return rejectWithValue("No stored user found");
      }

      return {
        user: JSON.parse(storedUser),
        token: storedToken,
      };
    } catch (error) {
      console.error("Error loading stored user:", error);
      return rejectWithValue("Failed to load user data");
    }
  }
);

// Login user thunk - add storage
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { rejectWithValue }) => {
    try {
      if (isE2EMode) {
        const user = {
          ...createE2EUser(),
          email: userData.email || "e2e.user@example.com",
          name: "E2E User",
        };
        await AsyncStorage.setItem("user", JSON.stringify(user));
        return user;
      }

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
        }),
      });

      if (!response.ok) return rejectWithValue("Login failed");

      const result = await response.json();

      // Store the user data in AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(result));
      if (result.token) {
        await AsyncStorage.setItem("token", result.token);
      }

      return result;
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

// Guest login thunk - add storage
export const loginGuest = createAsyncThunk(
  "auth/loginGuest",
  async (_, { rejectWithValue }) => {
    try {
      if (isE2EMode) {
        const user = createE2EUser();
        await AsyncStorage.setItem("user", JSON.stringify(user));
        return user;
      }

      const guestName = `Guest_${Math.floor(Math.random() * 10000)}`;

      const response = await fetch(`${API_URL}/guest-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: guestName,
          isGuest: true,
          status: "active",
        }),
      });

      if (!response.ok) return rejectWithValue("Guest login failed");

      const result = await response.json();
      result.isGuest = true;

      // Store the guest user data
      await AsyncStorage.setItem("user", JSON.stringify(result));
      if (result.token) {
        await AsyncStorage.setItem("token", result.token);
      }

      return result;
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const user = state.auth.user;
      const isGuest = user?.isGuest;
      const userId = user?.id;

      // If it's a guest user, delete from database
      if (isGuest && userId) {
        const token = await getAuthToken(getState);
        const headers = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        // Make API call to delete the guest user
        const response = await fetch(`${API_URL}/users/${userId}`, {
          method: "DELETE",
          headers,
        });

        if (!response.ok) {
          console.error("Failed to delete guest user");
        }
      }

      // Clear stored credentials regardless of user type
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("token");

      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      // We still want to clear local storage even if API call fails
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("token");

      return rejectWithValue("Logout failed");
    }
  }
);

// Fetch available matches
export const fetchMatches = createAsyncThunk(
  "auth/fetchMatches",
  async (_, { rejectWithValue }) => {
    try {
      if (isE2EMode) {
        return e2eMatches;
      }

      const response = await fetch(`${API_URL}/sessions`);
      if (!response.ok) return rejectWithValue("Failed to fetch matches");
      return await response.json();
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

// Create a new match
export const createMatch = createAsyncThunk(
  "auth/createMatch",
  async (_, { rejectWithValue, getState }) => {
    try {
      if (isE2EMode) {
        const currentUser = await getE2EUser();
        const createdMatch = {
          id: Date.now(),
          name: `E2E Match ${Math.floor(Math.random() * 1000)}`,
          status: "waiting",
          users: [
            currentUser,
            { id: 9003, name: "E2E Player 2", isGuest: true },
          ],
        };
        e2eMatches = [createdMatch, ...e2eMatches];
        return createdMatch;
      }

      const { auth } = getState();
      const userId = auth.user?.id;
      const authResult = await requireAuthToken(getState, rejectWithValue, "createMatch");
      if (authResult.error) return authResult.error;
      const { token } = authResult;

      // Create match
      const response = await fetch(`${API_URL}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: `Game Room ${Math.floor(Math.random() * 1000)}`,
          status: "waiting",
        }),
      });

      if (!response.ok) return rejectWithValue("Failed to create match");
      const match = await response.json();

      // Join the match automatically
      if (userId) {
        const joinResponse = await fetch(`${API_URL}/sessions/${match.id}/users/${userId}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!joinResponse.ok) {
          return rejectWithValue("Failed to join created match");
        }
      }
      return match;
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);
// Join an existing match
export const joinMatch = createAsyncThunk(
  "auth/joinMatch",
  async (matchId, { rejectWithValue, getState }) => {
    try {
      if (isE2EMode) {
        const currentUser = await getE2EUser();
        const matchIdNumber = Number(matchId);
        const targetMatch = e2eMatches.find(match => Number(match.id) === matchIdNumber);
        if (!targetMatch) return rejectWithValue("Match not found");

        const alreadyJoined = targetMatch.users.some(user => user.id === currentUser.id);
        if (!alreadyJoined) {
          targetMatch.users = [...targetMatch.users, currentUser];
        }
        return targetMatch;
      }

      const { auth } = getState();
      const userId = auth.user?.id;
      const authResult = await requireAuthToken(getState, rejectWithValue, "joinMatch");
      if (authResult.error) return authResult.error;
      const { token } = authResult;

      if (!userId) return rejectWithValue("Not logged in");

      const response = await fetch(
        `${API_URL}/sessions/${matchId}/users/${userId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) return rejectWithValue("Failed to join match");

      // Get updated match data
      const matchResponse = await fetch(`${API_URL}/sessions/${matchId}`);
      return await matchResponse.json();
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);
export const leaveMatch = createAsyncThunk(
  "auth/leaveMatch",
  async (payload, { getState, rejectWithValue }) => {
    try {
      if (isE2EMode) {
        e2eMatches = e2eMatches.map((match) => {
          if (Number(match.id) !== Number(payload.matchId)) return match;
          return {
            ...match,
            users: match.users.filter((user) => user.id !== payload.playerId),
          };
        });
        return { matchId: payload.matchId, userId: payload.playerId };
      }

      const state = getState();
      const userId = state.auth.user?.id;
      const authResult = await requireAuthToken(getState, rejectWithValue, "leaveMatch");
      if (authResult.error) return authResult.error;
      const { token } = authResult;
      if (!userId) {
        return rejectWithValue("User is not logged in");
      }

      if (!payload) {
        return rejectWithValue("No match ID provided");
      }
      // Make API request to leave the match
      const response = await fetch(
        `${API_URL}/sessions/${payload.matchId}/users/${payload.playerId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to leave match:", errorText);
        return rejectWithValue("Failed to leave match");
      }

      return { matchId: payload.matchId, userId: payload.playerId };
    } catch (error) {
      console.error("Error leaving match:", error);
      return rejectWithValue("Network error while leaving match");
    }
  }
);
export const fetchCurrentMatch = createAsyncThunk(
  "auth/fetchCurrentMatch",
  async (matchId, { getState, rejectWithValue }) => {
    try {
      if (isE2EMode) {
        const targetMatch = e2eMatches.find(match => Number(match.id) === Number(matchId));
        if (!targetMatch) return rejectWithValue("Failed to fetch match data");
        return targetMatch;
      }

      const state = getState();
      const authResult = await requireAuthToken(getState, rejectWithValue, "fetchCurrentMatch");
      if (authResult.error) return authResult.error;
      const { token } = authResult;

      // Fetch match data from your API
      const response = await fetch(`${API_URL}/sessions/${matchId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return rejectWithValue("Failed to fetch match data");
      }

      const matchData = await response.json();
      return matchData;
    } catch (error) {
      return rejectWithValue("Network error while fetching match data");
    }
  }
);

export const fetchMatchState = createAsyncThunk(
  "auth/fetchMatchState",
  async (matchId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const authResult = await requireAuthToken(getState, rejectWithValue, "fetchMatchState");
      if (authResult.error) return authResult.error;
      const { token } = authResult;

      const response = await fetch(`${API_URL}/sessions/${matchId}/state`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return rejectWithValue("Failed to fetch match state");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue("Network error while fetching match state");
    }
  }
);

export const submitMatchCommand = createAsyncThunk(
  "auth/submitMatchCommand",
  async ({ matchId, command }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const authResult = await requireAuthToken(getState, rejectWithValue, "submitMatchCommand");
      if (authResult.error) return authResult.error;
      const { token } = authResult;

      const response = await fetch(`${API_URL}/sessions/${matchId}/commands`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return rejectWithValue(errorText || "Failed to submit match command");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue("Network error while submitting command");
    }
  }
);
// unused
export const updateMatchStatus = createAsyncThunk(
  "auth/updateMatchStatus",
  async (session, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const authResult = await requireAuthToken(getState, rejectWithValue, "updateMatchStatus");
      if (authResult.error) return authResult.error;
      const { token } = authResult;

      // Make API request to update session status
      const response = await fetch(`${API_URL}/sessions/${session.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(session),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(
          errorData.message || "Failed to update match status"
        );
      }

      const updatedMatch = await response.json();
      return updatedMatch;
    } catch (error) {
      console.error("Error updating match status:", error);
      return rejectWithValue("Network error while updating match status");
    }
  }
);
export const deleteMatch = createAsyncThunk(
  "auth/deleteMatch",
  async (matchId, { rejectWithValue, getState }) => {
    try {
      console.log("Deleting match with ID:", matchId);
      const state = getState();
      const authResult = await requireAuthToken(getState, rejectWithValue, "deleteMatch");
      if (authResult.error) return authResult.error;
      const { token } = authResult;

      // Delete match
      const response = await fetch(`${API_URL}/sessions/${matchId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return rejectWithValue("Failed to delete match");
      const match = await response.json();

      return match;
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isLoggedIn: false,
    user: null,
    token: null,
    error: null,
    matches: [],
    currentMatch: null,
    currentMatchState: null,
    currentUserPage: null,
    lastCommandAck: null,
    commandError: null,
    loading: false,
    offlineModus: false,
  },
  reducers: {
    clearAuth: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.token = null;
      state.currentMatch = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    updateMatch: (state, action) => {
      // Update match data (e.g., from WebSocket)
      const index = state.matches.findIndex((m) => m.id === action.payload.id);
      if (index !== -1) {
        state.matches[index] = action.payload;
      } else {
        state.matches.push(action.payload);
      }
      if (state.currentMatch?.id === action.payload.id) {
        state.currentMatch = action.payload;
      }
    },
    setLoggedIn: (state, action) => {
      state.isLoggedIn = action.payload;
    },
    setCurrentUserPage: (state, action) => {
      state.currentUserPage = action.payload;
    },
    setOfflineModus: (state, action) => {
      state.offlineModus = action.payload;
    },
    setCurrentMatchState: (state, action) => {
      state.currentMatchState = action.payload;
    },
    clearCommandStatus: (state) => {
      state.lastCommandAck = null;
      state.commandError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.user = action.payload;
        state.token = action.payload?.token || null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginGuest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginGuest.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.user = action.payload;
        state.token = action.payload?.token || null;
        if (state.user) {
          state.user.isGuest = true; // Mark user as guest
        }
      })
      .addCase(loginGuest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loadStoredUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadStoredUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loadStoredUser.rejected, (state) => {
        state.loading = false;
        // We don't set an error here since this is a normal scenario
        // when the user hasn't logged in before
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
      .addCase(joinMatch.pending, (state) => {
        state.loading = true;
      })
      .addCase(joinMatch.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMatch = action.payload;
        const index = state.matches.findIndex(
          (m) => m.id === action.payload.id
        );
        if (index !== -1) {
          state.matches[index] = action.payload;
        }
      })
      .addCase(joinMatch.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchMatchState.pending, (state) => {
        state.loading = true;
        state.commandError = null;
      })
      .addCase(fetchMatchState.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMatchState = action.payload;
      })
      .addCase(fetchMatchState.rejected, (state, action) => {
        state.loading = false;
        state.commandError = action.payload;
      })
      .addCase(submitMatchCommand.pending, (state) => {
        state.commandError = null;
      })
      .addCase(submitMatchCommand.fulfilled, (state, action) => {
        state.lastCommandAck = action.payload;
      })
      .addCase(submitMatchCommand.rejected, (state, action) => {
        state.commandError = action.payload;
      })
      .addCase(updateUserStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.loading = false;

        // If it's the current user, update the user object
        if (state.user && state.user.id === action.payload.id) {
          state.user = {
            ...state.user,
            ...action.payload,
          };

          // Update local storage
          AsyncStorage.setItem("user", JSON.stringify(state.user));
        }

        // If the user is in the current match, update them there too
        if (state.currentMatch?.users) {
          const userIndex = state.currentMatch.users.findIndex(
            (u) => u.id === action.payload.id
          );
          if (userIndex !== -1) {
            state.currentMatch.users[userIndex] = {
              ...state.currentMatch.users[userIndex],
              ...action.payload,
            };
          }
        }
      })
      .addCase(updateUserStatus.rejected, (state) => {
        state.loading = false;
      })
      .addCase(leaveMatch.pending, (state) => {
        state.loading = true;
      })
      .addCase(leaveMatch.fulfilled, (state, action) => {
        state.loading = false;

        const { matchId, userId } = action.payload;
        // Remove the user from the current match
        if (state.currentMatch?.id === matchId) {
          state.currentMatch.users = state.currentMatch.users.filter(
            (user) => user.id !== userId
          );
          // If the current user is leaving, clear the currentMatch
          if (state.user?.id === userId) {
            state.currentMatch = null;
          }
        }
        // Optionally, update the matches list
        const matchIndex = state.matches.findIndex(
          (match) => match.id === matchId
        );
        if (matchIndex !== -1) {
          state.matches[matchIndex].users = state.matches[
            matchIndex
          ].users.filter((user) => user.id !== userId);
        }
      })
      .addCase(leaveMatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  updateMatch,
  clearAuth,
  setUser,
  setLoggedIn,
  setCurrentUserPage,
  setOfflineModus,
  setCurrentMatchState,
  clearCommandStatus,
} = authSlice.actions;

// Simple selectors
export const selectUser = (state) => state.auth.user;
export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;
export const selectMatches = (state) => state.auth.matches;
export const selectCurrentMatch = (state) => state.auth.currentMatch;
export const selectCurrentMatchState = (state) => state.auth.currentMatchState;
export const selectLastCommandAck = (state) => state.auth.lastCommandAck;
export const selectCommandError = (state) => state.auth.commandError;

export default authSlice.reducer;
