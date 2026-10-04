"use client";

import { useSyncExternalStore } from "react";
import { HISTORY_STORAGE_KEY, MAX_HISTORY_LENGTH, normalizeHistory } from "@/lib/bmi";
import type { BMIHistoryRecord } from "@/types/bmi";

const emptySnapshot = { records: [] as BMIHistoryRecord[], warning: "" };
let snapshot = emptySnapshot;
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!loaded) {
    loaded = true;
    let sessionValue: string | null = null;
    let localValue: string | null = null;
    let warning = "";
    try {
      sessionValue = window.sessionStorage.getItem(HISTORY_STORAGE_KEY);
    } catch {
      warning = "瀏覽器儲存無法使用，紀錄僅保留到本次頁面重新載入。";
    }
    // 已有 session 紀錄時不讀取舊 localStorage，避免其存取失敗影響載入。
    if (sessionValue === null) {
      try {
        localValue = window.localStorage.getItem(HISTORY_STORAGE_KEY);
      } catch { /* 舊資料不存在或無法存取時仍可使用計算器。 */ }
    }
    let records: BMIHistoryRecord[] = [];
    let parsed = false;
    try {
      records = normalizeHistory(JSON.parse(sessionValue ?? localValue ?? "[]"));
      parsed = true;
    } catch {
      warning = "歷史紀錄格式損壞，已略過；你仍可計算並儲存新的結果。";
    }
    snapshot = { records, warning };
    if (localValue !== null && parsed) {
      try {
        // 成功寫入新儲存位置後才移除舊資料。
        window.sessionStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(records));
        window.localStorage.removeItem(HISTORY_STORAGE_KEY);
      } catch {
        snapshot = { records, warning: "舊紀錄未能完成轉移，原始資料仍保留於瀏覽器。" };
      }
    }
    emit();
  }
  return () => { listeners.delete(listener); };
}

function updateHistory(records: BMIHistoryRecord[]) {
  const limited = records.slice(0, MAX_HISTORY_LENGTH);
  let warning = "";
  try {
    window.sessionStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(limited));
  } catch {
    warning = "瀏覽器儲存無法使用，紀錄僅保留到本次頁面重新載入。";
  }
  snapshot = { records: limited, warning };
  emit();
}

export function useBMIHistory() {
  const current = useSyncExternalStore(subscribe, () => snapshot, () => emptySnapshot);
  return {
    ...current,
    saveRecord: (record: BMIHistoryRecord) => updateHistory([record, ...snapshot.records]),
    deleteRecord: (id: string) => updateHistory(snapshot.records.filter((record) => record.id !== id)),
    clearHistory: () => updateHistory([]),
  };
}
