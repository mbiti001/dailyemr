import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("shows hero copy and navigation", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /every patient journey/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /launch workspace/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /browse patient registry/i })).toBeVisible();

    await expect(page.locator("dt", { hasText: /visits tracked/i })).toBeVisible();
    await expect(page.locator("dt", { hasText: /active today/i })).toBeVisible();
    await expect(page.locator("dt", { hasText: /revenue this month/i })).toBeVisible();
  });
});
