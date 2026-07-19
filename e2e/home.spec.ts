import { test, expect } from "@playwright/test";

test.use({ storageState: "playwright/.auth/user.json" });

test("home shows scenario cards", async ({ page }) => {
  await page.goto("/home");
  await page.waitForSelector("a[href*='/scenario/']");
  const cards = page.locator("a[href*='/scenario/']");
  await expect(cards).toHaveCount(3);
});

test("navigate to scenario page", async ({ page }) => {
  await page.goto("/home");
  await page.getByText("Transportation").click();
  await expect(page).toHaveURL(/\/scenario\/transportation/);
});
