Environment variables and Expo setup
=================================

This project reads runtime configuration from environment variables. Use `.env` for local development and `.env.example` as a template for required keys.

Important keys
- `REACT_APP_WS_URL` — WebSocket server URL (wss://... or https://.../ws)
- `REACT_APP_API_URL` — Base API URL
- `REACT_APP_PRODUCTION_URL` — Production API URL

Local usage (node scripts / web)
- Install `dotenv` (dev):

```bash
npm install dotenv --save-dev
```

- Load env in Node scripts by adding at top:

```js
require('dotenv').config();
// process.env.REACT_APP_WS_URL is now available
```

Expo / React Native (recommended)

Expo projects don't automatically load `.env` at runtime. Use one of these options:

1) Use `app.json` / `app.config.js` `extra` and `Constants.manifest.extra` (or `expo-constants`):

Example `app.config.js` that reads from process.env when building:

```js
// app.config.js
import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  extra: {
    REACT_APP_WS_URL: process.env.REACT_APP_WS_URL || 'https://api.example.com/ws',
    REACT_APP_API_URL: process.env.REACT_APP_API_URL || 'https://api.example.com'
  }
});
```

In code you can read via `expo-constants`:

```js
import Constants from 'expo-constants';
const wsUrl = (Constants.manifest?.extra || Constants.expoConfig?.extra).REACT_APP_WS_URL;
```

2) Use a library such as `react-native-dotenv` or `babel-plugin-inline-dotenv` for compile-time injection (less recommended for Expo-managed apps).

Security
- Never commit secrets to the repository. `.env` is ignored by `.gitignore`; commit only `.env.example`.

CI / Production
- Configure your CI/CD to set the same environment variables (e.g., GitHub Actions secrets, Azure App Service settings, or Expo Application Services config). Ensure `REACT_APP_WS_URL` is set to the production WebSocket endpoint.

Questions?
- Tell me if you want me to add an `app.config.js` file with the example and wire a small script to print `REACT_APP_WS_URL` for verification.
