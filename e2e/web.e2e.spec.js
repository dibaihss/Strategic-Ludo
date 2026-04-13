const { test, expect } = require("@playwright/test");

const openAppInE2EMode = async (page) => {
  await page.goto("/?e2e=1");
};

const openGuestNameModal = async (page) => {
  await page.getByTestId("login-guest-button").click();
  await expect(page.getByTestId("guest-name-modal")).toBeVisible();
};

const submitGuestName = async (page, name) => {
  await page.getByTestId("guest-name-input").fill(name ?? "E2E Guest");
  await page.getByTestId("guest-name-confirm-button").click();
};

const guestLogin = async (page, name = "E2E Guest") => {
  await openGuestNameModal(page);
  await submitGuestName(page, name);
  await expect(page.getByTestId("home-screen")).toBeVisible();
};

const openMultiplayerFromHome = async (page) => {
  await page.getByTestId("home-play-multiplayer-button").click();
  await expect(page.getByTestId("match-list-screen")).toBeVisible();
};

test("guest login routes to home", async ({ page }) => {
  await openAppInE2EMode(page);
  await guestLogin(page);
});

test("guest login rejects invalid guest name and stays on login", async ({ page }) => {
  await openAppInE2EMode(page);
  await openGuestNameModal(page);
  await submitGuestName(page, "   ");

  await expect(page.getByTestId("guest-name-modal")).toBeVisible();
  await expect(page.getByTestId("login-guest-button")).toBeVisible();
  await expect(page.getByTestId("home-screen")).not.toBeVisible();
});

test("multiplayer lobby flow can create a match", async ({ page }) => {
  await openAppInE2EMode(page);
  await guestLogin(page);

  await openMultiplayerFromHome(page);

  await page.getByTestId("match-list-create-button").click();
  await expect(page.getByTestId("waiting-room-screen")).toBeVisible();
});

test("multiplayer flow is resilient across back navigation and re-entry", async ({ page }) => {
  await openAppInE2EMode(page);
  await guestLogin(page);

  await openMultiplayerFromHome(page);
  await page.getByTestId("match-list-back-button").click();
  await expect(page.getByTestId("home-screen")).toBeVisible();

  await openMultiplayerFromHome(page);
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

test("offline mode modal cancellation keeps user on home and out of game", async ({ page }) => {
  await openAppInE2EMode(page);
  await guestLogin(page);

  await page.getByTestId("home-play-offline-button").click();
  await expect(page.getByTestId("offline-choice-modal")).toBeVisible();
  await page.getByTestId("offline-choice-cancel-button").click();

  await expect(page.getByTestId("offline-choice-modal")).not.toBeVisible();
  await expect(page.getByTestId("home-screen")).toBeVisible();
  await expect(page.getByTestId("game-screen")).not.toBeVisible();
});
