# Strategic Ludo Frontend

Strategic Ludo is a cross-platform frontend (Web, Android, iOS) for a turn-based Ludo game with both local play and realtime multiplayer.

## What This Project Does

- Runs local/offline matches fully on the client.
- Supports online multiplayer with waiting room + in-game realtime events.
- Manages game, session, auth, and UI state with Redux.
- Connects to backend services for matchmaking/session data and live game updates.

## Architecture (Simple View)

The app follows a layered structure:

1. UI Layer
- Screens and components render game state and capture player actions.
- Main areas: `Menu/`, `LobbyMatchMaking/`, `GameComponents/`, `UserAuthentication/`.

2. State Layer (Redux)
- Centralized state slices for auth, session, game, theme, and language.
- Async operations and server sync are handled in Redux thunks.
- Location: `assets/store/`.

3. Realtime Layer (Socket.IO)
- `WebSocketProvider` exposes `connected`, `subscribe`, `sendMessage`, and `sendMatchCommand`.
- Consumers use a stable hook API: `useWebSocket()`.
- Location: `assets/shared/webSocketConnection.jsx`.

4. Navigation & App Composition
- App providers and navigation setup are composed at the root.
- Entry files: `index.js`, `App.jsx`, `AppNavigator.jsx`.

## Realtime Event Model

The frontend keeps existing event names while using Socket.IO transport.

- Emit examples:
  - `/app/waitingRoom.gameStarted/{matchId}`
  - `/app/player.Move/{matchId}`
  - `/app/player.getPlayer/{matchId}`
- Subscribe examples:
  - `/topic/gameStarted/{matchId}`
  - `/topic/playerMove/{matchId}`
  - `/topic/currentPlayer/{matchId}`

This allows protocol compatibility with a Socket.IO backend (`/socket.io/*`) while preserving current gameplay message contracts.

## Folder Structure

- `App.jsx` - Root providers (Redux, WebSocket, gesture handler)
- `AppNavigator.jsx` - Navigation routes and screen flow
- `Menu/` - Main app/game screens
- `LobbyMatchMaking/` - Lobby and waiting room logic
- `GameComponents/` - Board, bases, players, timer, goals
- `UserAuthentication/` - Login/guest/auth screens
- `assets/shared/` - Shared utilities and realtime provider
- `assets/store/` - Redux store, slices, and async logic
- `e2e/` - Playwright tests

## Technologies Used

Core:
- React 19
- React Native 0.83
- Expo 55

State and navigation:
- Redux Toolkit
- React Redux
- React Navigation (native + native-stack)

Realtime and networking:
- Socket.IO Client
- Async Storage

UI/platform:
- React Native Gesture Handler
- React Native Reanimated
- React Native Screens
- React Native Safe Area Context
- Expo Keep Awake

Testing and tooling:
- Playwright (web E2E)
- Babel
- dotenv

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file (or copy from `.env.example`) and set values for your local/backend environment.

### 3. Run the app

```bash
npm start
```

Target-specific commands:

```bash
npm run web
npm run android
npm run ios
```

## NPM Scripts

- `npm start` - Start Expo dev server
- `npm run web` - Start web target
- `npm run android` - Start Android target
- `npm run ios` - Start iOS target
- `npm run web:e2e` - Start web app in E2E mode on fixed port
- `npm run e2e:web` - Run Playwright tests
- `npm run e2e:web:ui` - Run Playwright in UI mode
- `npm run e2e:web:update` - Update snapshots

## Development Notes

- Realtime is enabled only in online mode.
- Provider reconnect logic handles visibility/app state transitions.
- Local game mode continues to work without backend realtime connection.

## Current Status

- STOMP/SockJS client has been removed.
- Frontend realtime transport is now Socket.IO-based.
