const { test, expect } = require('@playwright/test');

// Utility: open app in E2E mode
const openAppInE2EMode = async (page) => {
  await page.goto('/?e2e=1');
};

// Utility: login as guest
const guestLogin = async (page, name = 'E2E BotTest') => {
  await page.getByTestId('login-guest-button').click();
  await expect(page.getByTestId('guest-name-modal')).toBeVisible();
  await page.getByTestId('guest-name-input').fill(name);
  await page.getByTestId('guest-name-confirm-button').click();
  await expect(page.getByTestId('home-screen')).toBeVisible();
};

// Utility: navigate to multiplayer and create a match with a bot
const createBotMatch = async (page) => {
  await page.getByTestId('home-play-multiplayer-button').click();
  await expect(page.getByTestId('match-list-screen')).toBeVisible();
  await page.getByTestId('match-list-create-button').click();
  await expect(page.getByTestId('waiting-room-screen')).toBeVisible();
  // Add bot
  const addBotButton = page.getByTestId('waiting-room-add-bot-button');
  if (await addBotButton.isVisible().catch(() => false)) {
    await addBotButton.click();
    await expect(page.getByTestId('waiting-room-bot-difficulty-modal')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('waiting-room-bot-difficulty-easy-button').click();
    await page.waitForTimeout(500);
  }
  // Start game
  await page.getByTestId('waiting-room-start-button').click();
  await expect(page.getByTestId('game-screen')).toBeVisible({ timeout: 15000 });
};

// Test: Leaving GameScreen during bot delay prevents bot move emit
// This test intercepts websocket or fetch requests to /player.Move and asserts none are sent after exit

test('leaving GameScreen during bot delay prevents bot move emit', async ({ page }) => {
  await openAppInE2EMode(page);
  await guestLogin(page, 'BotE2E');
  await createBotMatch(page);

  // Intercept websocket/fetch requests to /player.Move
  let moveEmitted = false;
  await page.route('**/player.Move/**', (route) => {
    moveEmitted = true;
    route.continue();
  });

  // Wait for bot turn to be scheduled (simulate bot delay, e.g. 500ms)
  await page.waitForTimeout(400); // Less than bot delay

  // Exit game before bot acts
  await page.getByTestId('game-exit-button').click();
  await page.getByTestId('game-exit-confirm-button').click();
  await expect(page.getByTestId('game-screen')).not.toBeVisible({ timeout: 5000 });

  // Wait enough time for bot to have acted if not cancelled
  await page.waitForTimeout(1200);

  // Assert no move was emitted after exit
  expect(moveEmitted).toBeFalsy();
});
