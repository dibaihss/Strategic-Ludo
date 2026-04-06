import { expect, test } from "@playwright/test";

test("loads_login_screen", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("login-screen").last()).toBeVisible();
  await expect(page.getByTestId("login-email-input").last()).toBeVisible();
  await expect(page.getByTestId("login-password-input").last()).toBeVisible();
  await expect(page.getByTestId("login-submit-button").last()).toBeVisible();
  await expect(page.getByTestId("login-offline-button").last()).toBeVisible();
});

test("register_roundtrip_navigate_back_to_login", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("login-register-button").last().click();
  await expect(page.getByTestId("register-screen").last()).toBeVisible();
  await page.getByTestId("register-back-login-button").last().click();
  await expect(page.getByTestId("login-submit-button").last()).toBeVisible();
});

test("offline_button_navigates_to_game", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/");
  await page.getByTestId("login-offline-button").last().click();
  await expect(page.getByTestId("game-screen").last()).toBeVisible({
    timeout: 40_000,
  });
});
