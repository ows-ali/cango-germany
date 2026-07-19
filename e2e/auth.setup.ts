import { test as setup } from "@playwright/test";
import path from "path";

const AUTH_FILE = path.resolve("playwright/.auth/user.json");

setup("authenticate", async ({ page }) => {
  await page.goto("/auth");
  await page.click('button:has-text("Log In")');
  await page.fill('input[type="email"]', "e2e@test.com");
  await page.fill('input[type="password"]', "123456");
  await page.click('button[type="submit"]');
  await page.waitForURL("/home");
  await page.context().storageState({ path: AUTH_FILE });
});
