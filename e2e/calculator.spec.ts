import { expect, test, type Page } from "@playwright/test";

async function calculate(page: Page, height = "170.5", weight = "65.5") {
  await page.getByLabel("身高 cm").fill(height);
  await page.getByLabel("體重 kg").fill(weight);
  await page.getByRole("button", { name: "看結果" }).click();
}

test("decimal calculation, saving, reloading, deleting and clearing", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await calculate(page);
  await expect(page.locator("figure")).toContainText("22.53");
  await page.getByRole("button", { name: "儲存換算結果" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.reload();
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.getByRole("button", { name: "刪除", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(0);
  await calculate(page);
  await page.getByRole("button", { name: "儲存換算結果" }).click();
  await page.getByRole("button", { name: "清除換算紀錄" }).click();
  await page.reload();
  await expect(page.locator("tbody tr")).toHaveCount(0);
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("rejects invalid input and prevents saving a stale result", async ({ page }) => {
  await page.goto("/");
  await calculate(page, "0", "65");
  await expect(page.locator("figure")).toHaveCount(0);
  await expect(page.locator("form").getByRole("alert")).toHaveText("請輸入大於 0 的有效身高與體重。");
  await calculate(page);
  await page.getByLabel("體重 kg").fill("-5");
  await expect(page.getByRole("button", { name: "儲存換算結果" })).toHaveCount(0);
  await page.getByLabel("體重 kg").fill("70");
  await page.getByLabel("體重 kg").press("Enter");
  await expect(page.locator("figure")).toContainText("24.08");
  await page.getByRole("button", { name: "重新計算 BMI" }).click();
  await expect(page.locator("figure")).toContainText("24.08");
});

test("retains the latest 15 saved records", async ({ page }) => {
  await page.goto("/");
  await calculate(page);
  for (let index = 0; index < 16; index++) {
    await page.getByRole("button", { name: "儲存換算結果" }).click();
  }
  await expect(page.locator("tbody tr")).toHaveCount(15);
  await page.reload();
  await expect(page.locator("tbody tr")).toHaveCount(15);
  expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem("history")!).length)).toBe(15);
});

test("migrates legacy storage before removing the original", async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("seeded")) {
      localStorage.setItem("history", JSON.stringify({ maxIdx: 2, data: {
        "2": { bmi: "22.49", bmiLevel: 1, height: "170", weight: "65", date: "2026/10/5" },
      } }));
      sessionStorage.setItem("seeded", "true");
    }
  });
  await page.goto("/");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  expect(await page.evaluate(() => localStorage.getItem("history"))).toBeNull();
  await page.reload();
  await expect(page.locator("tbody tr")).toHaveCount(1);
});

test("ignores corrupt history without crashing", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("history", "{invalid"));
  await page.goto("/");
  await expect(page.getByRole("status")).toContainText("格式損壞");
  await calculate(page);
  await page.getByRole("button", { name: "儲存換算結果" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(1);
});

test("storage denial allows in-memory saving and clearing", async ({ page }) => {
  await page.addInitScript(() => {
    for (const method of ["getItem", "setItem", "removeItem"]) {
      Object.defineProperty(Storage.prototype, method, { value() { throw new DOMException("blocked", "SecurityError"); } });
    }
  });
  await page.goto("/");
  await expect(page.getByRole("status")).toContainText("瀏覽器儲存無法使用");
  await calculate(page);
  await page.getByRole("button", { name: "儲存換算結果" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.getByRole("button", { name: "清除換算紀錄" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(0);
});

test("a failed migration preserves legacy data", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("history", JSON.stringify([{ id: "old", bmi: "22.49", height: "170", weight: "65", date: "2026/10/5" }]));
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (this === sessionStorage) throw new DOMException("full", "QuotaExceededError");
      set.call(this, key, value);
    };
  });
  await page.goto("/");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.getByRole("status")).toContainText("原始資料仍保留");
  expect(await page.evaluate(() => localStorage.getItem("history"))).not.toBeNull();
});

test("blocked local storage does not prevent loading session records", async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("history", JSON.stringify([{ id: "session", bmi: "22.49", height: "170", weight: "65", date: "2026/10/5" }]));
    Object.defineProperty(window, "localStorage", { get() { throw new DOMException("blocked", "SecurityError"); } });
  });
  await page.goto("/");
  await expect(page.locator("tbody tr")).toHaveCount(1);
});

test("malformed records are excluded and a corrupt legacy source is retained", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("history", "{invalid"));
  await page.goto("/");
  await expect(page.getByRole("status")).toContainText("格式損壞");
  expect(await page.evaluate(() => localStorage.getItem("history"))).toBe("{invalid");
  await page.evaluate(() => sessionStorage.setItem("history", JSON.stringify([
    { id: "invalid", date: "today", bmi: {} },
    { id: "valid", date: "today", bmi: "22.49", height: "170", weight: "65", description: "tampered" },
  ])));
  await page.reload();
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.locator("tbody")).toContainText("理想");
});
