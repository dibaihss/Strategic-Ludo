import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  API_URL,
  isE2EMode,
  getE2EUser,
  getE2EMatches,
  setE2EMatches,
  requireAuthToken,
} from "./sessionApiShared.jsx";
import { clearAuth, logout, updateUserStatus } from "./authSlice.jsx";

const MAX_MATCH_PLAYERS = 4;
const MAX_MATCH_BOTS = 3;

const isBotUser = (user) => Boolean(user?.isBot);

const mergeBotUsersIntoMatch = (incomingMatch, existingMatch) => {
  if (!incomingMatch) return incomingMatch;

  const incomingUsers = Array.isArray(incomingMatch.users) ? incomingMatch.users : [];
  const existingUsers = Array.isArray(existingMatch?.users) ? existingMatch.users : [];
  const existingBots = existingUsers.filter(isBotUser);

  if (existingBots.length === 0) {
    return incomingMatch;
  }

  const mergedUsers = [...incomingUsers];
  existingBots.forEach((bot) => {
    const alreadyExists = mergedUsers.some((user) => String(user.id) === String(bot.id));
    if (!alreadyExists) {
      mergedUsers.push(bot);
    }
  });

  return {
    ...incomingMatch,
    users: mergedUsers.slice(0, MAX_MATCH_PLAYERS),
  };
};

const addBotUserToMatch = (match, bot) => {
  if (!match || !bot) return match;

  const users = Array.isArray(match.users) ? match.users : [];
  const alreadyExists = users.some((user) => String(user.id) === String(bot.id));
  const botCount = users.filter(isBotUser).length;

  if (alreadyExists || users.length >= MAX_MATCH_PLAYERS || botCount >= MAX_MATCH_BOTS) {
    return match;
  }

  return {
    ...match,
    users: [...users, bot],
  };
};

export const fetchMatches = createAsyncThunk(
  "session/fetchMatches",
  async (_, { rejectWithValue }) => {
    try {
      if (isE2EMode) {
        return getE2EMatches();
      }

      const response = await fetch(`${API_URL}/sessions`);
      if (!response.ok) return rejectWithValue("Failed to fetch matches");
      return await response.json();
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

export const createMatch = createAsyncThunk(
  "session/createMatch",
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
        setE2EMatches([createdMatch, ...getE2EMatches()]);
        return createdMatch;
      }

      const { auth } = getState();
      const userId = auth.user?.id;
      const authResult = await requireAuthToken(getState, rejectWithValue, "createMatch");
      if (authResult.error) return authResult.error;
      const { token } = authResult;

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

export const joinMatch = createAsyncThunk(
  "session/joinMatch",
  async (matchId, { rejectWithValue, getState }) => {
    try {
      if (isE2EMode) {
        const currentUser = await getE2EUser();
        const matchIdNumber = Number(matchId);
        const targetMatch = getE2EMatches().find((match) => Number(match.id) === matchIdNumber);
        if (!targetMatch) return rejectWithValue("Match not found");

        const alreadyJoined = targetMatch.users.some((user) => user.id === currentUser.id);
        if (!alreadyJoined) {
          targetMatch.users = [...targetMatch.users, currentUser];
          setE2EMatches([...getE2EMatches()]);
        }
        return targetMatch;
      }

      const { auth } = getState();
      const userId = auth.user?.id;
      const authResult = await requireAuthToken(getState, rejectWithValue, "joinMatch");
      if (authResult.error) return authResult.error;
      const { token } = authResult;

      if (!userId) return rejectWithValue("Not logged in");

      const response = await fetch(`${API_URL}/sessions/${matchId}/users/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return rejectWithValue("Failed to join match");

      const matchResponse = await fetch(`${API_URL}/sessions/${matchId}`);
      return await matchResponse.json();
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

export const leaveMatch = createAsyncThunk(
  "session/leaveMatch",
  async (payload, { getState, rejectWithValue }) => {
    try {
      if (isE2EMode) {
        const updatedMatches = getE2EMatches().map((match) => {
          if (Number(match.id) !== Number(payload.matchId)) return match;
          return {
            ...match,
            users: match.users.filter((user) => user.id !== payload.playerId),
          };
        });
        setE2EMatches(updatedMatches);
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

      const response = await fetch(`${API_URL}/sessions/${payload.matchId}/users/${payload.playerId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

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
  "session/fetchCurrentMatch",
  async (matchId, { getState, rejectWithValue }) => {
    try {
      if (isE2EMode) {
        const targetMatch = getE2EMatches().find((match) => Number(match.id) === Number(matchId));
        if (!targetMatch) return rejectWithValue("Failed to fetch match data");
        return targetMatch;
      }

      const authResult = await requireAuthToken(getState, rejectWithValue, "fetchCurrentMatch");
      if (authResult.error) return authResult.error;
      const { token } = authResult;

      const response = await fetch(`${API_URL}/sessions/${matchId}/with-users/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return rejectWithValue("Failed to fetch match data");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue("Network error while fetching match data");
    }
  }
);

export const fetchMatchState = createAsyncThunk(
  "session/fetchMatchState",
  async (matchId, { getState, rejectWithValue }) => {
    try {
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
  "session/submitMatchCommand",
  async ({ matchId, command }, { getState, rejectWithValue }) => {
    try {
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

export const updateMatchStatus = createAsyncThunk(
  "session/updateMatchStatus",
  async (session, { getState, rejectWithValue }) => {
    try {
      const authResult = await requireAuthToken(getState, rejectWithValue, "updateMatchStatus");
      if (authResult.error) return authResult.error;
      const { token } = authResult;

     
      const payload = {
        name: session.name,
        status: session.status,
        maxPlayers: session.maxPlayers ?? session.max_players,
      };

      const response = await fetch(`${API_URL}/sessions/${session.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData.message || "Failed to update match status");
      }

      const updatedSession = await response.json().catch(() => null);
      return updatedSession || { ...session, ...payload };
    } catch (error) {
      console.error("Error updating match status:", error);
      return rejectWithValue("Network error while updating match status");
    }
  }
);

export const deleteMatch = createAsyncThunk(
  "session/deleteMatch",
  async (matchId, { rejectWithValue, getState }) => {
    try {
      const authResult = await requireAuthToken(getState, rejectWithValue, "deleteMatch");
      if (authResult.error) return authResult.error;
      const { token } = authResult;

      const response = await fetch(`${API_URL}/sessions/${matchId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return rejectWithValue("Failed to delete match");
      return await response.json();
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

const sessionSlice = createSlice({
  name: "session",
  initialState: {
    matches: [],
    currentMatch: null,
    currentMatchState: null,
    lastCommandAck: null,
    commandError: null,
    loading: false,
    error: null,
  },
  reducers: {
    updateMatch: (state, action) => {
      if (!action.payload) {
        state.currentMatch = null;
        return;
      }

      const existingMatch =
        state.currentMatch?.id === action.payload.id
          ? state.currentMatch
          : state.matches.find((m) => m.id === action.payload.id);
      const mergedMatch = mergeBotUsersIntoMatch(action.payload, existingMatch);

      const index = state.matches.findIndex((m) => m.id === mergedMatch.id);
      if (index !== -1) {
        state.matches[index] = mergedMatch;
      } else {
        state.matches.push(mergedMatch);
      }
      if (!state.currentMatch || state.currentMatch?.id === mergedMatch.id) {
        state.currentMatch = mergedMatch;
      }
    },
    addBotToMatch: (state, action) => {
      const { matchId, bot } = action.payload || {};
      if (!matchId || !bot) return;

      if (state.currentMatch?.id === matchId) {
        state.currentMatch = addBotUserToMatch(state.currentMatch, bot);
      }

      state.matches = state.matches.map((match) =>
        match.id === matchId ? addBotUserToMatch(match, bot) : match
      );
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
      .addCase(fetchMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.matches = action.payload;
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })
      .addCase(createMatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMatch.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMatch = action.payload;
        const exists = state.matches.some((m) => m.id === action.payload.id);
        if (!exists) {
          state.matches.push(action.payload);
        }
      })
      .addCase(createMatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })
      .addCase(joinMatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinMatch.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMatch = action.payload;
        const index = state.matches.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.matches[index] = action.payload;
        }
      })
      .addCase(joinMatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
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
      .addCase(leaveMatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(leaveMatch.fulfilled, (state, action) => {
        state.loading = false;

        const { matchId, userId } = action.payload;
        if (state.currentMatch?.id === matchId) {
          const currentUsers = Array.isArray(state.currentMatch.users) ? state.currentMatch.users : [];
          state.currentMatch.users = currentUsers.filter((user) => user.id !== userId);
        }

        const matchIndex = state.matches.findIndex((match) => match.id === matchId);
        if (matchIndex !== -1) {
          const matchUsers = Array.isArray(state.matches[matchIndex].users) ? state.matches[matchIndex].users : [];
          state.matches[matchIndex].users = matchUsers.filter((user) => user.id !== userId);
        }
      })
      .addCase(leaveMatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        if (state.currentMatch?.users) {
          const userIndex = state.currentMatch.users.findIndex((u) => u.id === action.payload.id);
          if (userIndex !== -1) {
            state.currentMatch.users[userIndex] = {
              ...state.currentMatch.users[userIndex],
              ...action.payload,
            };
          }
        }

        state.matches = state.matches.map((match) => {
          if (!Array.isArray(match.users)) return match;
          return {
            ...match,
            users: match.users.map((u) => (u.id === action.payload.id ? { ...u, ...action.payload } : u)),
          };
        });
      })
      .addCase(clearAuth, (state) => {
        state.matches = [];
        state.currentMatch = null;
        state.currentMatchState = null;
        state.lastCommandAck = null;
        state.commandError = null;
        state.loading = false;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.matches = [];
        state.currentMatch = null;
        state.currentMatchState = null;
        state.lastCommandAck = null;
        state.commandError = null;
        state.loading = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        state.matches = [];
        state.currentMatch = null;
        state.currentMatchState = null;
        state.lastCommandAck = null;
        state.commandError = null;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { updateMatch, addBotToMatch, setCurrentMatchState, clearCommandStatus } = sessionSlice.actions;

export const selectMatches = (state) => state.session.matches;
export const selectCurrentMatch = (state) => state.session.currentMatch;
export const selectCurrentMatchState = (state) => state.session.currentMatchState;
export const selectLastCommandAck = (state) => state.session.lastCommandAck;
export const selectCommandError = (state) => state.session.commandError;

export default sessionSlice.reducer;
