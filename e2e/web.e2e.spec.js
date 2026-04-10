const { test, expect } = require("@playwright/test");

const openAppInE2EMode = async (page) => {
  await page.goto("/?e2e=1");
};

const guestLogin = async (page) => {
  await page.getByTestId("login-guest-button").click();
  await expect(page.getByTestId("home-screen")).toBeVisible();
};

test("guest login routes to home", async ({ page }) => {
  await openAppInE2EMode(page);
  await guestLogin(page);
});

test("multiplayer lobby flow can create a match", async ({ page }) => {
  await openAppInE2EMode(page);
  await guestLogin(page);

  await page.getByTestId("home-play-multiplayer-button").click();
  await expect(page.getByTestId("match-list-screen")).toBeVisible();

  await page.getByTestId("match-list-create-button").click();
  await expect(page.getByTestId("waiting-room-screen")).toBeVisible();
});

test("local game flow can perform turn action", async ({ page }) => {
  await openAppInE2EMode(page);
  await guestLogin(page);

  await page.getByTestId("home-play-offline-button").click();
  await expect(page.getByTestId("offline-choice-modal")).toBeVisible();
  await page.getByTestId("offline-choice-local-button").click();
  await expect(page.getByTestId("game-screen")).toBeVisible();

  await page.getByTestId("game-skip-turn-button").click();
  await expect(page.getByTestId("game-exit-button")).toBeVisible();
});
