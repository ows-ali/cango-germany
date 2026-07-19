import { test, expect } from "@playwright/test";

test.use({ storageState: "playwright/.auth/user.json" });

test("experience page loads with Complete Lesson button", async ({ page }) => {
  await page.goto("/scenario/transportation");
  await page.getByText("Platform Changes").first().click();
  await expect(page).toHaveURL(/\/experience\/\d+/);
  await expect(page.getByText("Complete Lesson")).toBeVisible();
});
