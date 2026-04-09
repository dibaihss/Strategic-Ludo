---
name: multiplayer-lobby-flow
description: Guides agents on implementing and improving multiplayer lobby and matchmaking flows in the Strategic Ludo app.
version: 1.0.0
license: MIT
---

# Multiplayer Lobby Flow

## When to Use This Skill

Use this skill when the user asks for help with:
- multiplayer matchmaking screens
- lobby state management
- waiting room UI and player ready flow
- real-time room join/leave behavior
- synchronizing game start conditions for players

## What It Helps With

- identifying core multiplayer lobby components and screens
- keeping lobby UI responsive during network delays
- handling player join, leave, ready, and game-start transitions
- providing consistent feedback for connection and matchmaking state
- designing a flow that works well on mobile and tablet in Expo

## How to Use It

1. Locate the lobby flow files in the repo, such as `LobbyMatchMaking/MultiplayerMenu.jsx` and `LobbyMatchMaking/WaitingRoom.jsx`.
2. Use this skill when implementing or refactoring any of these behaviors:
   - creating or joining a room
   - displaying the current player list
   - updating ready status
   - blocking game start until all players are ready
3. Prefer a clear state model for the lobby:
   - `idle` / `searching` / `matched` / `waiting` / `ready` / `starting`
   - separate UI state from network state
4. Give the user actionable advice for UX:
   - show an animated loading indicator when matchmaking is in progress
   - show a centralized status message for connection issues
   - disable the start button until required players are present
5. If they ask for architecture, recommend a small state slice in Redux or context for the lobby rather than scattering logic across components.

## Notes for this Repo

- Keep multiplayer-related navigation separate from normal game screens.
- Keep lobby transitions quick and avoid full-screen reloads when players join/leave.
- Preserve existing patterns in `LobbyMatchMaking/` and integrate with the current navigation structure.
