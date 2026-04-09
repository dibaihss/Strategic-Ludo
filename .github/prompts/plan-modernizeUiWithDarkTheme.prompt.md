## Plan: Modernize UI with Dark Theme

Update the app's non-game UI pages (login, register, home, waiting room, etc.) to a modern dark design inspired by contemporary mobile apps, with black backgrounds, improved consistency, and enhanced visual hierarchy.

**Steps**
1. Update theme system in `assets/store/themeSlice.jsx` to add a new "Modern Dark" theme with black backgrounds, gradients, and glassmorphism effects.
2. Refactor `UserAuthentication/login.jsx` with modern styling: dark background, glassmorphism input fields, gradient buttons, and improved layout.
3. Update `UserAuthentication/Register.jsx` to match the new login design.
4. Modernize `Menu/Home.jsx` with dark theme, card redesign, and better spacing.
5. Update `LobbyMatchMaking/WaitingRoom.jsx` with consistent dark styling and improved player cards.
6. Apply consistent changes to other menu pages like `Menu/Anleitung.jsx` and `LobbyMatchMaking/MultiplayerMenu.jsx`.
7. Test all pages for responsiveness and theme switching.

**Relevant files**
- `assets/store/themeSlice.jsx` — Add new theme
- `UserAuthentication/login.jsx` — Priority redesign
- `UserAuthentication/Register.jsx` — Match login
- `Menu/Home.jsx` — Dashboard redesign
- `LobbyMatchMaking/WaitingRoom.jsx` — Player UI update
- `Menu/Anleitung.jsx` — Modal styling
- `LobbyMatchMaking/MultiplayerMenu.jsx` — Match list styling

**Verification**
1. Run app in Expo Go and test theme switching between old and new themes.
2. Check login/register flow on small screens (<375px width).
3. Verify waiting room displays correctly with 2-4 players.
4. Test home page stats and buttons on different screen sizes.
5. Ensure no broken references to undefined theme colors.

**Decisions**
- Use black (#000000) as primary background with subtle gradients.
- Implement glassmorphism for cards and inputs using backdrop-filter.
- Standardize button heights to 50px and border radius to 12px.
- Add subtle animations for interactions (fade in/out).
- Keep existing icon set but increase sizes for better visibility.

**Further Considerations**
1. Should we add a theme toggle button in the home page for easy switching?
2. Do you want to include custom fonts or stick with system fonts?
3. Any specific color accents (beyond the game colors) for the dark theme?