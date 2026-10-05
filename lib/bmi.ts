import type { BMIHistoryRecord, BMIResult } from "../types/bmi";

export const HISTORY_STORAGE_KEY = "history";
export const MAX_HISTORY_LENGTH = 15;

const BMI_SETTINGS = [
  { maxBMI: 18.5, color: "#31BAF9", description: "過輕" },
  { maxBMI: 24, color: "#86D73E", description: "理想" },
  { maxBMI: 27, color: "#FF982D", description: "過重" },
  { maxBMI: Infinity, color: "#FF1200", description: "肥胖" },
] as const;

export function calculateBMI(height: string, weight: string): BMIResult | null {
  const parsedHeight = Number(height);
  const parsedWeight = Number(weight);
  if (
    !Number.isFinite(parsedHeight) ||
    !Number.isFinite(parsedWeight) ||
    parsedHeight <= 0 ||
    parsedWeight <= 0
  )
    return null;

  const bmi = parsedWeight / (parsedHeight / 100) ** 2;
  if (!Number.isFinite(bmi) || bmi <= 0 || !Number.isFinite(bmi * 100))
    return null;
  const rounded = Math.round(bmi * 100) / 100;
  if (rounded <= 0) return null;

  // 分級使用未四捨五入的數值，避免邊界附近被分到下一級。
  const bmiLevel = BMI_SETTINGS.findIndex((setting) => bmi < setting.maxBMI);
  const { color, description } = BMI_SETTINGS[bmiLevel];
  return {
    bmi: rounded.toString(),
    bmiLevel,
    color,
    description,
    height: height.trim(),
    weight: weight.trim(),
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeHistory(value: unknown): BMIHistoryRecord[] {
  let candidates: unknown[] = [];
  if (Array.isArray(value)) {
    candidates = value;
  } else if (
    isObject(value) &&
    Number.isSafeInteger(value.maxIdx) &&
    Number(value.maxIdx) >= 0 &&
    isObject(value.data)
  ) {
    // 只走訪實際存在的項目，避免異常 maxIdx 造成無限迴圈。
    candidates = Object.entries(value.data)
      .filter(
        ([key]) => /^\d+$/.test(key) && Number(key) <= Number(value.maxIdx),
      )
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([id, record]) => (isObject(record) ? { ...record, id } : null));
  }

  const records: BMIHistoryRecord[] = [];
  const ids = new Set<string>();
  for (const item of candidates) {
    if (
      !isObject(item) ||
      typeof item.id !== "string" ||
      !item.id.trim() ||
      ids.has(item.id) ||
      typeof item.date !== "string" ||
      !item.date.trim() ||
      typeof item.height !== "string" ||
      typeof item.weight !== "string" ||
      typeof item.bmi !== "string" ||
      !Number.isFinite(Number(item.bmi)) ||
      Number(item.bmi) <= 0
    )
      continue;
    const result = calculateBMI(item.height, item.weight);
    if (!result) continue;
    ids.add(item.id);
    records.push({ ...result, id: item.id, date: item.date });
    if (records.length === MAX_HISTORY_LENGTH) break;
  }
  return records;
}
