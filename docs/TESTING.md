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

## Troubleshooting

- If Jest tries to run Playwright files, verify `testPathIgnorePatterns` in `jest.config.js` includes `e2e`.
- If React Native transforms fail in Jest, check `transformIgnorePatterns` in `jest.config.js`.
- If E2E tests fail to connect, start the app with `npm run web:e2e` and verify port `19006`.
- If test selectors are flaky, add or stabilize component `testID` props.
