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

async function seedDoctorSession(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      "medi-portal-session",
      JSON.stringify({
        state: {
          session: { accessToken: "e2e-mock-token", userId: "doctor", role: "doctor" },
          role: "doctor",
          token: "e2e-mock-token",
        },
        version: 0,
      }),
    );
  });
}

async function mockComprehensiveApi(page: import("@playwright/test").Page) {
  await page.route("**/api/v1/lab/fundus/comprehensive**", async (route) => {
    const url = route.request().url();
    const mode = url.includes("mode=precise") ? "precise(5-model)" : "fast(v10)";
    const body = {
      ...comprehensiveFixture,
      overall_assessment: {
        ...comprehensiveFixture.overall_assessment,
        inference_mode: mode,
      },
    };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
}

async function runBilateralUpload(page: import("@playwright/test").Page) {
  await page.goto("portal/fundus/upload");
  await page.getByTestId("upload-inference-fast").click();

  const odZone = page.getByText("우안 (OD)").locator("..").getByRole("button");
  const [odChooser] = await Promise.all([page.waitForEvent("filechooser"), odZone.click()]);
  await odChooser.setFiles({ name: "od.png", mimeType: "image/png", buffer: TINY_PNG_OD });

  const osZone = page.getByText("좌안 (OS)").locator("..").getByRole("button");
  const [osChooser] = await Promise.all([page.waitForEvent("filechooser"), osZone.click()]);
  await osChooser.setFiles({ name: "os.png", mimeType: "image/png", buffer: TINY_PNG_OS });

  await page.getByLabel("환자 ID").fill("E2E-PATIENT");
  await page.getByTestId("fundus-analyze-submit").click();
  await expect(page).toHaveURL(/portal\/fundus\/results/, { timeout: 30_000 });
}

test.describe.configure({ mode: "serial" });

test.describe("Portal E2E — DASHBOARD-UX-SPEC 6시나리오", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await seedDoctorSession(page);
    await mockComprehensiveApi(page);
    if (!testInfo.title.includes("reviews")) {
      await runBilateralUpload(page);
    }
  });

  test("1. 업로드 → fast 모드 결과 표시", async ({ page }) => {
    await expect(page.getByTestId("bilateral-results")).toBeVisible();
    await expect(page.getByText(/DR G1/i).first()).toBeVisible();
    await expect(page.getByText(/fast\(v10\)/i).first()).toBeVisible();
  });

  test("2. GradCAM 슬라이더 동작", async ({ page }) => {
    const slider = page.getByTestId("gradcam-slider").first();
    await expect(slider).toBeVisible();
    await slider.fill("75");
    await expect(slider).toHaveValue("75");
  });

  test("3. BilateralView 좌우 패널", async ({ page }) => {
    await expect(page.getByText("좌안 (OS)").first()).toBeVisible();
    await expect(page.getByText("우안 (OD)").first()).toBeVisible();
    await page.getByTestId("compare-mode-toggle").click();
    await expect(page.getByTestId("compare-mode-toggle")).toHaveClass(/warning/);
  });

  test("4. Fast/Precise 토글", async ({ page }) => {
    const preciseBtn = page.getByTestId("inference-mode-precise").first();
    await preciseBtn.click();
    await expect(preciseBtn).not.toHaveAttribute("aria-busy", "true", { timeout: 20_000 });
    await expect(
      page.locator('[data-testid="inference-mode-precise"][aria-pressed="true"]').first(),
    ).toBeVisible({ timeout: 5_000 });
  });

  test("5. FHIR보내기 다운로드", async ({ page }) => {
    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("fhir-export-both").click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/fhir-fundus-bilateral/);
  });

  test("6. reviews 화면 APPROVE 처리", async ({ page }) => {
    const reviewItem = {
      id: "e2e-review-1",
      patientId: "E2E-PATIENT",
      createdAt: new Date().toISOString(),
      primaryConcern: "dr",
      status: "pending_review",
      snapshot: {
        patient_id: "E2E-PATIENT",
        analyzed_at: new Date().toISOString(),
        os: comprehensiveFixture,
      },
      originalImages: {
        os: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      },
    };
    await page.addInitScript(
      ({ session, reviews }) => {
        localStorage.setItem("medi-portal-session", JSON.stringify(session));
        localStorage.setItem(
          "medi-portal-reviews",
          JSON.stringify({ state: { items: [reviews] }, version: 0 }),
        );
      },
      {
        session: {
          state: {
            session: { accessToken: "e2e-mock-token", userId: "doctor", role: "doctor" },
            role: "doctor",
            token: "e2e-mock-token",
          },
          version: 0,
        },
        reviews: reviewItem,
      },
    );
    await page.goto("portal/reviews");
    await expect(page.getByRole("heading", { name: /진단 리뷰/i })).toBeVisible();
    await expect(page.getByText("E2E-PATIENT")).toBeVisible();
    await page.getByTestId("review-decision-APPROVE").click();
    await expect(page.getByText(/대기 중인 리뷰가 없습니다/)).toBeVisible({
      timeout: 10_000,
    });
  });
});
