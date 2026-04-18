# Testing Guide

This project uses two testing layers:

- Unit tests (Jest + `jest-expo`) for game logic and component behavior.
- End-to-end tests (Playwright) for real browser user flows.

Using both layers keeps fast feedback for game rules while still validating full app behavior in web mode.

## Current Test Structure

### Unit tests (Jest)

- Config: `jest.config.js`
- Setup: `jest.setup.js`
- Example logic test: `GameComponents/Bases.logic.test.js`
- Example component test: `GameComponents/Bases.test.jsx`

### End-to-end tests (Playwright)

- E2E specs: `e2e/`
- Current web spec: `e2e/web.e2e.spec.js`
- Playwright config: `playwright.config.js`

## Run Tests

Unit tests:

```bash
npm test
```

Web E2E (headless):

```bash
npm run e2e:web
```

Web E2E (UI mode):

```bash
npm run e2e:web:ui
```

Start app for E2E mode (separate terminal when needed):

```bash
npm run web:e2e
```

## Naming and Location Conventions

- Unit tests: keep close to feature/components, with `*.test.js` or `*.test.jsx`
- E2E tests: keep under `e2e/`, with `*.spec.js`
- Prefer descriptive test names that describe behavior, not implementation details

## Adding Unit Tests

Use unit tests when validating:

- Game rules and pure logic (movement, turn rules, validation)
- Component behavior under mocked state/services
- Action dispatch behavior and callback routing

Recommended patterns used in this repo:

- Extract pure helpers into a dedicated logic module (example: `GameComponents/Bases.logic.js`)
- Mock Redux hooks (`useSelector`, `useDispatch`) for component-level tests
- Mock WebSocket hook (`useWebSocket`) to test online/offline branches
- Use stable `testID` values for interactive elements targeted by tests
- Mock UI dependencies that are not part of behavior under test (icons, child components)

## Adding E2E Tests

Use Playwright tests when validating:

- User journeys across screens and navigation
- Multi-step gameplay flows visible in a real browser runtime
- Integration behavior that unit tests cannot fully prove

Keep E2E tests focused on high-value paths and critical regressions. Keep business-rule edge cases mostly in unit tests for speed and maintainability.

## Unit vs E2E: Quick Decision

- Choose unit tests when logic can be isolated or mocked.
- Choose E2E tests when browser/runtime integration is the risk.
- For core gameplay features, add both:
  - Unit tests for rule correctness and branch coverage.
  - One E2E smoke path for user-visible confidence.


## Running E2E Tests Against a Mocked Backend

By default, Playwright E2E tests run against a mocked backend. This is useful for fast, isolated UI and flow testing without requiring a real server.

### Commands
- **Run all E2E tests (mocked backend, headless):**
  ```bash
  npm run e2e:web
  ```
- **Run all E2E tests (mocked backend, UI mode):**
  ```bash
  npm run e2e:web:ui
  ```
- **Run a specific E2E test file (mocked backend, UI mode, single worker):**
  ```bash
  npx playwright test e2e/multiplayer.e2e.spec.js --headed --workers=1
  ```
  - This command runs the specified test file in a visible browser window (not headless) and ensures only one test runs at a time (useful for debugging and watching the test flow).

---

## Running E2E Tests Against a Real Backend

You can run Playwright E2E tests against a real backend API (instead of the default mock server) to validate full integration.

### Prerequisites
- The real backend (API and WebSocket) must be running and accessible at `http://localhost:3000` (or set `EXPO_PUBLIC_LOCALHOST_API_URL`/`EXPO_PUBLIC_LOCALHOST_WS_URL` as needed).
- Ensure ports 19006 (public) and 19007 (Expo web) are free. The test runner will attempt to kill any process using these ports automatically.

### Commands
- **Start E2E with real backend (headless):**
  ```bash
  npm run e2e:web:real
  ```
- **Start E2E with real backend (UI mode):**
  ```bash
  npm run e2e:web:real:headed
  ```
- **Run a specific test:**
  ```bash
  npm run e2e:web:real -- e2e/multiplayer.e2e.spec.js -g "user can login as guest"
  ```

### How it works
- The command launches a proxy script (`scripts/start-playwright-proxy.cjs`) that:
  - Starts Expo web on port 19007.
  - Proxies the app on port 19006.
  - Forwards API/WebSocket calls to your real backend.
  - Kills any process using the required ports before starting.
- Playwright then runs tests against `http://127.0.0.1:19006`.

### Troubleshooting Real Backend E2E
- If you see a port-in-use error, check for other running Expo or Node processes and stop them.
- If the app cannot connect to the backend, verify your backend is running and accessible at the expected URL.
- If you want a dry run to see which processes would be killed, ask for a preflight script.

---

- If Jest tries to run Playwright files, verify `testPathIgnorePatterns` in `jest.config.js` includes `e2e`.
- If React Native transforms fail in Jest, check `transformIgnorePatterns` in `jest.config.js`.
- If E2E tests fail to connect, start the app with `npm run web:e2e` and verify port `19006`.
- If test selectors are flaky, add or stabilize component `testID` props.
