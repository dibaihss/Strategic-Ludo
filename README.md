# Strategic Ludo Frontend

React Native + Expo frontend for a multiplayer Ludo game with local and online play modes.

## Tech Stack

- React 19
- React Native / Expo
- React Navigation
- Redux Toolkit
- Socket.IO client for realtime multiplayer

## App Features

- Local game mode (offline)
- Multiplayer game mode (online)
- Waiting room and match lifecycle
- Turn-based movement, player selection, skip turn
- Player presence handling (join/leave/inactive/back)
- Cross-platform targets: Web, Android, iOS

## Project Structure

- `App.jsx`, `AppNavigator.jsx`: app bootstrap and navigation
- `Menu/`: game screens (home, game screen, modal flows)
- `LobbyMatchMaking/`: waiting room and matchmaking UI
- `GameComponents/`: board, bases, goals, timer, players
- `assets/store/`: Redux slices and async thunks
- `assets/shared/webSocketConnection.jsx`: realtime provider layer

## Realtime Socket Function (How It Works)

### Overview



### Connection

Socket.IO client connects to backend with:

- Base URL: `REACT_APP_SOCKET_URL`
- Path: `REACT_APP_SOCKET_PATH` (default `/socket.io`)
- Transports: `websocket`, `polling`
- Optional token auth: `REACT_APP_SOCKET_AUTH_TOKEN`

### Realtime Flow Examples

1. Player move:
- UI sends `/app/player.Move/{matchId}` with `type: movePlayer`
- Mapping converts to `client_message`
- Backend emits `server_message`
- Topic filter routes move updates to subscribers of `/topic/playerMove/{matchId}`

2. Player selection:
- UI sends `/app/player.getPlayer/{matchId}`
- Backend responds via `server_message`
- Topic filter routes to `/topic/currentPlayer/{matchId}`

3. Waiting room events:
- UI sends `/app/waitingRoom.gameStarted/{matchId}` with types like `startGame`, `userJoined`, `userLeft`
- Backend broadcasts `server_message`
- Topic filter routes to `/topic/gameStarted/{matchId}`

### Match Recovery + Command API

For multiplayer MVP reliability, the frontend now supports:

- Snapshot recovery endpoint: `GET /sessions/{id}/state`
- Idempotent command endpoint: `POST /sessions/{id}/commands`
- Socket contracts: `match.state.snapshot`, `match.state.delta`, `match.command.rejected`

Move commands use this flow:

1. Submit command to REST with `requestId`.
2. If REST fails, fallback to legacy Socket.IO emit.
3. Apply incoming snapshot/delta events to Redux game state.

## Environment Variables

Copy `.env.example` to `.env` and update values:

- `REACT_APP_SOCKET_URL`
- `REACT_APP_SOCKET_PATH=/socket.io`
- `REACT_APP_SOCKET_AUTH_TOKEN` (if backend requires auth)
- `REACT_APP_API_URL`

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start app:

```bash
npm start
```

3. Run target:

```bash
npm run web
npm run android
npm run ios
```
