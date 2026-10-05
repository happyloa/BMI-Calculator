import "./style.css";
import {
  calculateBMI,
  HISTORY_STORAGE_KEY,
  MAX_HISTORY_LENGTH,
  normalizeHistory,
} from "../lib/bmi.ts";
import type { BMIHistoryRecord, BMIResult } from "../types/bmi.ts";

function element<T extends HTMLElement>(selector: string): T {
  const found = document.querySelector<T>(selector);
  if (!found) throw new Error(`Missing element: ${selector}`);
  return found;
}

const form = element<HTMLFormElement>("#calculator");
const height = element<HTMLInputElement>("#height");
const weight = element<HTMLInputElement>("#weight");
const output = element("#result");
const error = element("#input-error");
const warning = element("#storage-warning");
const rows = element<HTMLTableSectionElement>("#records");
let result: BMIResult | null = null;
let records: BMIHistoryRecord[] = [];

function showMessage(target: HTMLElement, message: string) {
  target.textContent = message;
  target.hidden = !message;
}

function loadHistory() {
  let sessionValue: string | null = null;
  let localValue: string | null = null;
  try {
    sessionValue = sessionStorage.getItem(HISTORY_STORAGE_KEY);
  } catch {
    showMessage(warning, "瀏覽器儲存無法使用，紀錄僅保留到本次頁面重新載入。");
  }
  if (sessionValue === null) {
    try {
      localValue = localStorage.getItem(HISTORY_STORAGE_KEY);
    } catch {
      /* Legacy storage is optional. */
    }
  }
  try {
    records = normalizeHistory(JSON.parse(sessionValue ?? localValue ?? "[]"));
  } catch {
    showMessage(
      warning,
      "歷史紀錄格式損壞，已略過；你仍可計算並儲存新的結果。",
    );
    return;
  }
  if (localValue !== null) {
    try {
      sessionStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(records));
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch {
      showMessage(warning, "舊紀錄未能完成轉移，原始資料仍保留於瀏覽器。");
    }
  }
}

function updateHistory(next: BMIHistoryRecord[]) {
  records = next.slice(0, MAX_HISTORY_LENGTH);
  try {
    sessionStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(records));
    showMessage(warning, "");
  } catch {
    showMessage(warning, "瀏覽器儲存無法使用，紀錄僅保留到本次頁面重新載入。");
  }
  renderHistory();
}

function renderHistory() {
  rows.replaceChildren();
  element("#empty-history").hidden = records.length > 0;
  element("#history-scroll").hidden = records.length === 0;
  for (const record of records) {
    const row = document.createElement("tr");
    const flag = document.createElement("span");
    flag.style.backgroundColor = record.color;
    flag.setAttribute("aria-hidden", "true");
    row.insertCell().append(flag);
    // Storage values are untrusted: render text rather than HTML.
    for (const value of [
      record.description,
      record.bmi,
      record.weight,
      record.height,
      record.date,
    ]) {
      row.insertCell().textContent = value;
    }
    const button = document.createElement("button");
    button.type = "button";
    button.className = "delete";
    button.textContent = "刪除";
    button.addEventListener("click", () => {
      const index = records.findIndex((item) => item.id === record.id);
      updateHistory(records.filter((item) => item.id !== record.id));
      const buttons = rows.querySelectorAll<HTMLButtonElement>("button");
      (
        buttons[Math.min(index, buttons.length - 1)] ?? element("#clear")
      ).focus();
    });
    row.insertCell().append(button);
    rows.append(row);
  }
}

function renderResult() {
  output.replaceChildren();
  if (!result) {
    const button = document.createElement("button");
    button.type = "submit";
    button.className = "calculate";
    button.textContent = "看結果";
    output.append(button);
    return;
  }
  const figure = document.createElement("figure");
  figure.style.color = result.color;
  const group = document.createElement("div");
  const value = document.createElement("div");
  value.className = "result-value";
  const number = document.createElement("span");
  number.textContent = result.bmi;
  const label = document.createElement("small");
  label.textContent = "BMI";
  value.append(number, label);
  const actions = document.createElement("div");
  actions.className = "result-actions";
  const recalculate = document.createElement("button");
  recalculate.type = "submit";
  recalculate.className = "icon-button recalculate";
  recalculate.style.backgroundColor = result.color;
  recalculate.setAttribute("aria-label", "重新計算 BMI");
  const save = document.createElement("button");
  save.type = "button";
  save.className = "icon-button save";
  save.style.backgroundColor = result.color;
  save.setAttribute("aria-label", "儲存換算結果");
  save.addEventListener("click", () => {
    if (!result) return;
    updateHistory([
      {
        ...result,
        id: crypto.randomUUID(),
        date: new Date().toLocaleString("zh-TW"),
      },
      ...records,
    ]);
  });
  actions.append(recalculate, save);
  group.append(value, actions);
  const caption = document.createElement("figcaption");
  caption.textContent = result.description;
  figure.append(group, caption);
  output.append(figure);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  result = calculateBMI(height.value, weight.value);
  showMessage(error, result ? "" : "請輸入大於 0 的有效身高與體重。");
  for (const input of [height, weight])
    input.setAttribute("aria-invalid", String(!result));
  renderResult();
  if (result) output.querySelector<HTMLButtonElement>("button")?.focus();
});
form.addEventListener("input", () => {
  result = null;
  showMessage(error, "");
  for (const input of [height, weight]) input.removeAttribute("aria-invalid");
  renderResult();
});
element("#clear").addEventListener("click", () => updateHistory([]));
loadHistory();
renderHistory();
