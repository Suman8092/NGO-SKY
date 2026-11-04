import { expect, test } from "@playwright/test";

test("homepage exposes the primary donation journey", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const withheld = page.getByRole("heading", { level: 1, name: "Public information is awaiting verified release." });
  if (await withheld.isVisible()) {
    await page.getByRole("link", { name: "Check donation availability" }).first().click();
    await expect(page).toHaveURL(/\/donate/);
    await expect(page.getByRole("heading", { level: 1, name: /turn your care into.*forward motion/i })).toBeVisible();
    await expect(page.getByRole("region", { name: "Payment availability notice" })).toBeVisible();
    return;
  }
  await expect(
    page.getByRole("heading", { level: 1, name: /hope should not wait/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /support our work/i }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: /support our work/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/donate/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /turn your care into.*forward motion/i,
    }),
  ).toBeVisible();
  const continueButton = page.getByRole("button", { name: /continue securely/i });
  if (await continueButton.count()) {
    await expect(continueButton).toBeVisible();
  } else {
    await expect(page.getByRole("region", { name: "Payment availability notice" })).toBeVisible();
  }
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
  const continueButton = page.getByRole("button", { name: /continue securely/i });
  if (await continueButton.count()) {
    await expect(continueButton).toBeVisible();
  } else {
    await expect(page.getByRole("region", { name: "Payment availability notice" })).toBeVisible();
  }
});


test("protected operational APIs deny anonymous access", async ({ request }) => {
  const admin = await request.post("/api/admin/operations", { data: { action: "update_contact_status", id: "abc", status: "resolved" } });
  expect(admin.status()).toBe(403);
  const checkin = await request.get("/api/events/checkin?code=TKT-12345678");
  expect(checkin.status()).toBe(403);
});
