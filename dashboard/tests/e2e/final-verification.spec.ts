import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const comprehensiveFixture = JSON.parse(
  readFileSync(join(__dirname, "fixtures/comprehensive-fast.json"), "utf-8"),
);

const TINY_PNG_OD = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);
const TINY_PNG_OS = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
  "base64",
);

/** API 응답에 대용량 heatmap 포함 — persist strip 검증용 */
function heavyComprehensiveBody(mode: string) {
  const big = "data:image/png;base64," + "X".repeat(500_000);
  return {
    ...comprehensiveFixture,
    glaucoma: {
      ...comprehensiveFixture.glaucoma,
      heatmap: { image_base64: big, lesion_annotations: [] },
    },
    heatmap: {
      glaucoma: { image_base64: big },
      dr: { image_base64: big },
    },
    overall_assessment: {
      ...comprehensiveFixture.overall_assessment,
      inference_mode: mode.includes("precise") ? "precise(5-model)" : "fast(v10)",
    },
  };
}

test.describe.configure({ mode: "serial" });

test.describe("Final verification — Web Dashboard v1 운영 검증", () => {
  const consoleErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors.length = 0;
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.addInitScript(() => {
      localStorage.removeItem("medi-portal-reviews");
      localStorage.removeItem("medi-portal-reviews-v2");
      localStorage.removeItem("medi-portal-reviews-v3");
      localStorage.removeItem("medi-portal-session");
    });

    await page.route("**/api/v1/lab/fundus/comprehensive**", async (route) => {
      const url = route.request().url();
      const mode = url.includes("mode=precise") ? "precise" : "fast";
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(heavyComprehensiveBody(mode)),
      });
    });
  });

  test("1–2. upload 접속 + 양안 Fast 분석", async ({ page }) => {
    await page.goto("portal/fundus/upload");
    await expect(page.getByRole("heading", { name: /안저 이미지 업로드/i })).toBeVisible();
    await page.getByTestId("upload-inference-fast").click();

    const odZone = page.getByText("우안 (OD)").locator("..").getByRole("button");
    const [odChooser] = await Promise.all([page.waitForEvent("filechooser"), odZone.click()]);
    await odChooser.setFiles({ name: "od.png", mimeType: "image/png", buffer: TINY_PNG_OD });

    const osZone = page.getByText("좌안 (OS)").locator("..").getByRole("button");
    const [osChooser] = await Promise.all([page.waitForEvent("filechooser"), osZone.click()]);
    await osChooser.setFiles({ name: "os.png", mimeType: "image/png", buffer: TINY_PNG_OS });

    await page.getByLabel("환자 ID").fill("FINAL-VERIFY");
    await page.getByTestId("fundus-analyze-submit").click();
    await expect(page).toHaveURL(/portal\/fundus\/results/, { timeout: 30_000 });
  });

  test("3–5. 결과 렌더 + localStorage v3 + 콘솔 에러 없음", async ({ page }) => {
    await page.goto("portal/fundus/upload");
    await page.getByTestId("upload-inference-fast").click();
    const odZone = page.getByText("우안 (OD)").locator("..").getByRole("button");
    const [odChooser] = await Promise.all([page.waitForEvent("filechooser"), odZone.click()]);
    await odChooser.setFiles({ name: "od.png", mimeType: "image/png", buffer: TINY_PNG_OD });
    const osZone = page.getByText("좌안 (OS)").locator("..").getByRole("button");
    const [osChooser] = await Promise.all([page.waitForEvent("filechooser"), osZone.click()]);
    await osChooser.setFiles({ name: "os.png", mimeType: "image/png", buffer: TINY_PNG_OS });
    await page.getByLabel("환자 ID").fill("FINAL-VERIFY");
    await page.getByTestId("fundus-analyze-submit").click();
    await expect(page).toHaveURL(/portal\/fundus\/results/, { timeout: 30_000 });

    await expect(page.getByTestId("bilateral-results")).toBeVisible();
    await expect(page.getByText(/DR G1/i).first()).toBeVisible();
    await expect(page.getByTestId("gradcam-slider").first()).toBeVisible();
    await page.waitForTimeout(500);

    const storage = await page.evaluate(() => localStorage.getItem("medi-portal-reviews-v3"));
    expect(storage, "medi-portal-reviews-v3 must exist").not.toBeNull();
    const parsed = JSON.parse(storage!) as { state?: { items?: unknown[] } };
    expect(Array.isArray(parsed.state?.items)).toBe(true);
    expect((parsed.state?.items ?? []).length).toBeGreaterThan(0);
    expect(storage!.length).toBeLessThan(200_000);

    const bad = consoleErrors.filter((t) =>
      /QuotaExceeded|setItem on 'Storage'|MIME type|text\/html/i.test(t),
    );
    expect(bad, bad.join("\n")).toHaveLength(0);
  });

  test("6. doctor 로그인 → reviews 리스트", async ({ page }) => {
    await page.goto("portal/fundus/upload");
    await page.getByRole("button", { name: /doctor · doctor/i }).click();
    await expect(page.getByRole("button", { name: /로그아웃/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("link", { name: /진단 리뷰/i })).toBeVisible({ timeout: 5_000 });

    await page.getByRole("link", { name: /진단 리뷰/i }).click();
    await expect(page).toHaveURL(/portal\/reviews/);
    await expect(page.getByRole("heading", { name: /진단 리뷰/i })).toBeVisible({ timeout: 10_000 });
  });

  test("7–8. Fast→Precise 토글 + FHIR 내보내기", async ({ page }) => {
    await page.goto("portal/fundus/upload");
    await page.getByTestId("upload-inference-fast").click();
    const odZone = page.getByText("우안 (OD)").locator("..").getByRole("button");
    const [odChooser] = await Promise.all([page.waitForEvent("filechooser"), odZone.click()]);
    await odChooser.setFiles({ name: "od.png", mimeType: "image/png", buffer: TINY_PNG_OD });
    const osZone = page.getByText("좌안 (OS)").locator("..").getByRole("button");
    const [osChooser] = await Promise.all([page.waitForEvent("filechooser"), osZone.click()]);
    await osChooser.setFiles({ name: "os.png", mimeType: "image/png", buffer: TINY_PNG_OS });
    await page.getByLabel("환자 ID").fill("FINAL-VERIFY");
    await page.getByTestId("fundus-analyze-submit").click();
    await expect(page).toHaveURL(/portal\/fundus\/results/, { timeout: 30_000 });

    const preciseBtn = page.getByTestId("inference-mode-precise").first();
    await preciseBtn.click();
    await expect(preciseBtn).not.toHaveAttribute("aria-busy", "true", { timeout: 20_000 });
    await expect(
      page.locator('[data-testid="inference-mode-precise"][aria-pressed="true"]').first(),
    ).toBeVisible({ timeout: 5_000 });

    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("fhir-export-both").click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/fhir-fundus-bilateral/);
  });
});
