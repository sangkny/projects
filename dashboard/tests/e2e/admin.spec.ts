import { expect, test } from "@playwright/test";

async function seedAdminSession(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      "medi-portal-session",
      JSON.stringify({
        state: {
          session: { accessToken: "e2e-mock-token", userId: "admin", role: "admin" },
          role: "admin",
          token: "e2e-mock-token",
        },
        version: 0,
      }),
    );
  });
}

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

test.describe("Admin E2E — UX 3단계", () => {
  test("1. /admin/performance 로드 + 모델 카드 표시", async ({ page }) => {
    await seedAdminSession(page);
    await page.goto("admin/performance");
    await expect(page.getByRole("heading", { name: /성능 모니터/i })).toBeVisible();
    await expect(page.getByTestId("v10c-banner")).toBeVisible();
    await expect(page.getByTestId("perf-card-v10c")).toBeVisible();
    await expect(page.getByTestId("perf-card-dr_v4")).toBeVisible();
  });

  test("2. /admin/audit 로드 + 리스트 표시", async ({ page }) => {
    await seedAdminSession(page);
    await page.goto("admin/audit");
    await expect(page.getByRole("heading", { name: /감사 로그/i })).toBeVisible();
    await expect(page.getByTestId("audit-log-table")).toBeVisible();
    await expect(page.getByText("REGISTER").first()).toBeVisible();
  });

  test("3. /admin/ontology 로드 + 통과율 표시", async ({ page }) => {
    await seedAdminSession(page);
    await page.route("**/api/v1/ontology/stats**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          domain: "medical",
          today_validations: 50,
          pass_rate: 0.92,
          top_errors: [{ code: "GLAU-SEM-005", count: 3, message: "test" }],
          generated_at: new Date().toISOString(),
        }),
      });
    });
    await page.goto("admin/ontology");
    await expect(page.getByRole("heading", { name: /Ontology 모니터/i })).toBeVisible();
    await expect(page.getByTestId("ontology-pass-rate")).toContainText("92.0%");
    await expect(page.getByTestId("ontology-rule-GLAU-SEM-005")).toBeVisible();
  });

  test("4. non-admin role 접근 시 차단", async ({ page }) => {
    await seedDoctorSession(page);
    await page.goto("admin/performance");
    await expect(page.getByRole("heading", { name: /접근 권한 없음/i })).toBeVisible();
    await expect(page.getByText(/현재: doctor/i)).toBeVisible();
  });
});
