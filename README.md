# Strategic Ludo Frontend

React Native + Expo frontend for a multiplayer Ludo game with local and online play modes.

## Tech Stack

- React 18
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
- `assets/shared/realtime/`: socket adapter, mapping, payload utilities

## Realtime Socket Function (How It Works)

### Overview

The app uses `socket.io-client` to keep all multiplayer clients synchronized in realtime.

Core implementation:

- Provider: `assets/shared/webSocketConnection.jsx`
- Adapter: `assets/shared/realtime/SocketIoAdapter.js`
- Mapping: `assets/shared/realtime/mapping.js`

### Connection

Socket.IO client connects to backend with:

- Base URL: `REACT_APP_SOCKET_URL`
- Path: `REACT_APP_SOCKET_PATH` (default `/socket.io`)
- Transports: `websocket`, `polling`
- Optional token auth: `REACT_APP_SOCKET_AUTH_TOKEN`

On connect, the provider joins the current match room (`joinMatch(matchId)`).

### Event Contract Used by This Frontend

Current backend-facing events:

- Client -> Server: `client_message`
- Server -> Client: `server_message`

Payload shape used internally:

```json
{
  "matchId": "string",
  "type": "string",
  "payload": {},
  "meta": {
    "requestId": "string",
    "clientTs": 0,
    "version": 1
  }
}
```

### Legacy Compatibility Layer

Many UI modules still call legacy STOMP-style APIs:

- Publish-style calls (examples):
  - `/app/player.Move/{matchId}`
  - `/app/player.getPlayer/{matchId}`
  - `/app/waitingRoom.gameStarted/{matchId}`
- Subscribe-style topics (examples):
  - `/topic/playerMove/{matchId}`
  - `/topic/currentPlayer/{matchId}`
  - `/topic/gameStarted/{matchId}`

The mapping layer translates these calls to Socket.IO:

- Legacy send destinations -> `client_message`
- Legacy subscribe topics <- filtered `server_message`

So existing components can keep using `sendMessage()` and `subscribe()` while the transport is Socket.IO.

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
- `REACT_APP_RT_TRANSPORT=socketio`
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

## Notes

- Backend must expose Socket.IO on `/socket.io`.
- If backend event names change, update `assets/shared/realtime/mapping.js`.
- Some old STOMP-related packages may still exist in `package.json`, but active realtime path is Socket.IO.
