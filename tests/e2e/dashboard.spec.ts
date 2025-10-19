import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("renders metrics and navigation cards", async ({ page }) => {
    await page.goto("/dashboard");

    const cards = page.locator("article", { hasText: /registered patients|active visits/i });
    await expect(cards.first()).toBeVisible();

    await expect(page.getByText(/visit volume/i)).toBeVisible();
    await expect(page.getByText(/lab operations/i)).toBeVisible();

    const workspaceLinks = page.getByRole("link", { name: /enter workspace/i });
    await expect(workspaceLinks).toHaveCount(4);
  });
});
