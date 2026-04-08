Environment variables and Expo setup
=================================

This project reads runtime configuration from environment variables. Use `.env` for local development and `.env.example` as a template for required keys.

Important keys
- `REACT_APP_SOCKET_URL` - Socket.IO server base URL (`https://...` or local `http://...`)
- `REACT_APP_SOCKET_PATH` - Socket.IO path (default `/socket.io`)
- `REACT_APP_SOCKET_AUTH_TOKEN` - Token sent in Socket.IO `auth` handshake
- `REACT_APP_API_URL` - Base API URL
- `REACT_APP_PRODUCTION_URL` - Production API URL

Local usage (node scripts / web)
- Install `dotenv` (dev):

```bash
npm install dotenv --save-dev
```

- Load env in Node scripts by adding at top:

```js
require('dotenv').config();
// process.env.REACT_APP_SOCKET_URL is now available
```

Expo / React Native (recommended)

Expo projects do not automatically load `.env` at runtime. Use one of these options:

1) Use `app.json` / `app.config.js` `extra` and `Constants.manifest.extra` (or `expo-constants`).

Example `app.config.js` that reads from process.env when building:

```js
// app.config.js
import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  extra: {
    REACT_APP_SOCKET_URL: process.env.REACT_APP_SOCKET_URL || 'https://api.example.com',
    REACT_APP_SOCKET_PATH: process.env.REACT_APP_SOCKET_PATH || '/socket.io',
    REACT_APP_SOCKET_AUTH_TOKEN: process.env.REACT_APP_SOCKET_AUTH_TOKEN || '',
    REACT_APP_API_URL: process.env.REACT_APP_API_URL || 'https://api.example.com'
  }
});
```

In code you can read via `expo-constants`:

```js
import Constants from 'expo-constants';
const extra = Constants.manifest?.extra || Constants.expoConfig?.extra;
const socketUrl = extra?.REACT_APP_SOCKET_URL;
```

Security
- Never commit secrets to the repository. `.env` is ignored by `.gitignore`; commit only `.env.example`.

CI / Production
- Configure your CI/CD to set the same environment variables.
- Ensure `REACT_APP_SOCKET_PATH=/socket.io` unless your backend uses a custom path.
