import { expect, test } from "@playwright/test";

test.describe("Portal fundus upload smoke", () => {
  test("upload page loads with core UI", async ({ page }) => {
    await page.goto("portal/fundus/upload");

    await expect(page.getByRole("heading", { name: /안저 이미지 업로드/i })).toBeVisible();
    await expect(page.getByText("추론 모드")).toBeVisible();
    await expect(page.getByRole("button", { name: /분석 시작/i })).toBeVisible();
    await expect(page.getByText(/User Portal/i).first()).toBeVisible();
  });
});
