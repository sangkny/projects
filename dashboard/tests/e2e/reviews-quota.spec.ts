import { expect, test } from "@playwright/test";

import { buildPersistPayload, stripHeavyFromReviewItem } from "../../src/utils/reviewsPersist";

function fakeB64(kb: number): string {
  return `data:image/png;base64,${"B".repeat(kb * 1024)}`;
}

test.describe("reviews persist — QuotaExceeded 방지", () => {
  test("대용량 bilateral payload strip 후 100KB 미만", () => {
    const hm = fakeB64(400);
    const item = {
      id: "t1",
      patientId: "P",
      createdAt: new Date().toISOString(),
      primaryConcern: "dr",
      status: "pending_review" as const,
      snapshot: {
        os: {
          dr: { dr_grade: 1, confidence: 0.9 },
          glaucoma: { heatmap: { image_base64: hm }, glaucoma_grade: 0, grade_label: "n", label: "n", probability: 0.1, risk_level: "LOW" as const, confidence: 0.9 },
          heatmap: { glaucoma: { image_base64: hm }, dr: { image_base64: hm } },
          overall_assessment: {
            referral_urgency: "routine" as const,
            primary_concern: "dr",
            findings: [],
            recommendation: "",
            inference_mode: "fast",
            inference_time_ms: 1,
          },
        },
        od: {
          dr: { dr_grade: 1, confidence: 0.9 },
          glaucoma: { heatmap: { image_base64: hm }, glaucoma_grade: 0, grade_label: "n", label: "n", probability: 0.1, risk_level: "LOW" as const, confidence: 0.9 },
          heatmap: { glaucoma: { image_base64: hm } },
          overall_assessment: {
            referral_urgency: "routine" as const,
            primary_concern: "dr",
            findings: [],
            recommendation: "",
            inference_mode: "fast",
            inference_time_ms: 1,
          },
        },
      },
      originalImages: { os: fakeB64(1500), od: fakeB64(1500) },
    };

    const rawKb = JSON.stringify(item).length / 1024;
    const strippedKb = JSON.stringify(stripHeavyFromReviewItem(item)).length / 1024;
    const persistKb = JSON.stringify(buildPersistPayload([item])).length / 1024;

    expect(rawKb).toBeGreaterThan(5000);
    expect(strippedKb).toBeLessThan(100);
    expect(persistKb).toBeLessThan(100);
  });

  test("fundus 결과 진입 시 콘솔 QuotaExceededError 없음", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    const big = "data:image/png;base64," + "X".repeat(500_000);

    await page.addInitScript(() => {
      localStorage.removeItem("medi-portal-reviews");
      localStorage.removeItem("medi-portal-reviews-v2");
    });

    await page.route("**/api/v1/lab/fundus/comprehensive**", async (route) => {
      const body = {
        dr: { dr_grade: 1, confidence: 0.82, decision: "REVISE" },
        glaucoma: {
          glaucoma_grade: 0,
          grade_label: "normal",
          label: "normal",
          probability: 0.12,
          risk_level: "LOW",
          confidence: 0.88,
          heatmap: { image_base64: big, lesion_annotations: [] },
        },
        heatmap: {
          glaucoma: { image_base64: big },
          dr: { image_base64: big },
        },
        overall_assessment: {
          referral_urgency: "routine",
          primary_concern: "dr",
          findings: ["DR G1"],
          recommendation: "test",
          inference_mode: "fast(v10)",
          inference_time_ms: 100,
        },
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(body),
      });
    });

    await page.addInitScript(() => {
      localStorage.setItem(
        "medi-portal-session",
        JSON.stringify({
          state: { session: { accessToken: "e2e", userId: "doctor", role: "doctor" }, role: "doctor", token: "e2e" },
          version: 0,
        }),
      );
    });

    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64",
    );

    await page.goto("portal/fundus/upload");
    const odZone = page.getByText("우안 (OD)").locator("..").getByRole("button");
    const [odChooser] = await Promise.all([page.waitForEvent("filechooser"), odZone.click()]);
    await odChooser.setFiles({ name: "od.png", mimeType: "image/png", buffer: png });

    const osZone = page.getByText("좌안 (OS)").locator("..").getByRole("button");
    const [osChooser] = await Promise.all([page.waitForEvent("filechooser"), osZone.click()]);
    await osChooser.setFiles({
      name: "os.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
        "base64",
      ),
    });

    await page.getByLabel("환자 ID").fill("QUOTA-TEST");
    await page.getByTestId("fundus-analyze-submit").click();
    await expect(page).toHaveURL(/portal\/fundus\/results/, { timeout: 30_000 });
    await expect(page.getByTestId("bilateral-results")).toBeVisible();
    await page.waitForTimeout(800);

    const quotaErrors = consoleErrors.filter((t) => /QuotaExceeded|setItem on 'Storage'/i.test(t));
    expect(quotaErrors, quotaErrors.join("\n")).toHaveLength(0);

    const stored = await page.evaluate(() => localStorage.getItem("medi-portal-reviews-v2")?.length ?? 0);
    if (stored > 0) {
      expect(stored).toBeLessThan(200_000);
    }
  });
});
