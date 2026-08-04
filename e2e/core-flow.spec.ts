import { expect, test } from "@playwright/test";

test("homepage exposes the primary donation journey", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { level: 1, name: /hope should not wait/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /make hope happen/i }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: /make hope happen/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/donate/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /turn your care into.*forward motion/i,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /continue securely/i }),
  ).toBeVisible();
});

test("keyboard users can skip repeated navigation", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: /skip to main content/i });
  await expect(skipLink).toBeFocused();
  await skipLink.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("critical public routes return content", async ({ page }) => {
  test.setTimeout(120_000);
  for (const route of [
    "/about",
    "/programs",
    "/campaigns",
    "/impact",
    "/volunteer",
    "/contact",
    "/donate/success",
  ]) {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(
      response?.ok(),
      `${route} should return a successful response`,
    ).toBeTruthy();
    await expect(page.locator("h1")).toBeVisible();
  }
});

test("a cancelled checkout returns to a truthful donation state", async ({
  page,
}) => {
  await page.goto("/donate?status=cancelled", {
    waitUntil: "domcontentloaded",
  });
  await expect(
    page.getByRole("status").filter({ hasText: /checkout was closed/i }),
  ).toContainText(/no payment was taken/i);
  await expect(
    page.getByRole("button", { name: /continue securely/i }),
  ).toBeVisible();
});
