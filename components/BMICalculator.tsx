"use client";

// 主要的 BMI 計算互動式元件，負責輸入、計算與紀錄管理。

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import HistoryList from "@/components/HistoryList";
import InputField from "@/components/InputField";
import ResultDisplay from "@/components/ResultDisplay";
import { BMIHistoryRecord, BMIResult } from "@/types/bmi";

// 各 BMI 區間的設定，包含顏色與描述文字。
const BMI_SETTINGS = [
  { maxBMI: 18.5, color: "#31BAF9", description: "過輕" },
  { maxBMI: 24, color: "#86D73E", description: "理想" },
  { maxBMI: 27, color: "#FF982D", description: "過重" },
  { maxBMI: Number.POSITIVE_INFINITY, color: "#FF1200", description: "肥胖" },
] as const;

// 儲存在 sessionStorage 中的 key 與最大歷史筆數。
const HISTORY_STORAGE_KEY = "history";
const MAX_HISTORY_LENGTH = 15;

type LegacyHistory = {
  maxIdx: number;
  data: Record<
    string,
    {
      bmiLevel: number;
      bmi: string;
      weight: string;
      height: string;
      date: string;
    }
  >;
};

// 將舊版或不合法的歷史資料轉換成目前使用的陣列格式。
function normalizeHistory(value: unknown): BMIHistoryRecord[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .filter((item): item is BMIHistoryRecord => {
        return (
          typeof item === "object" &&
          item !== null &&
          typeof (item as BMIHistoryRecord).id === "string" &&
          typeof (item as BMIHistoryRecord).date === "string"
        );
      })
      .map((item) => ({
        ...item,
        color: BMI_SETTINGS[item.bmiLevel]?.color ?? item.color ?? "#86D73E",
        description:
          BMI_SETTINGS[item.bmiLevel]?.description ?? item.description ?? "理想",
      }));
  }

  if (typeof value === "object" && value !== null) {
    const legacy = value as LegacyHistory;
    if (typeof legacy.maxIdx === "number" && typeof legacy.data === "object") {
      const records: BMIHistoryRecord[] = [];
      for (let index = legacy.maxIdx; index >= 0; index -= 1) {
        const record = legacy.data[String(index)];
        if (!record) continue;
        records.push({
          id: `${index}`,
          bmi: record.bmi,
          bmiLevel: record.bmiLevel,
          color: BMI_SETTINGS[record.bmiLevel]?.color ?? "#86D73E",
          description: BMI_SETTINGS[record.bmiLevel]?.description ?? "理想",
          height: record.height,
          weight: record.weight,
          date: record.date,
        });
      }
      return records;
    }
  }

  return [];
}

// 依照 BMI 值找到對應的設定索引。
function determineLevel(bmi: number): number {
  return BMI_SETTINGS.findIndex((setting) => bmi < setting.maxBMI);
}

export default function BMICalculator() {
  // 儲存使用者當前的身高、體重輸入值與計算結果。
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState<BMIResult | null>(null);
  // 歷史紀錄與載入狀態用於控制序列化流程。
  const [history, setHistory] = useState<BMIHistoryRecord[]>([]);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    // 進行序列化讀取，並兼容舊版 localStorage 的資料格式。
    try {
      const sessionValue = window.sessionStorage.getItem(HISTORY_STORAGE_KEY);
      const localValue =
        typeof window.localStorage !== "undefined"
          ? window.localStorage.getItem(HISTORY_STORAGE_KEY)
          : null;
      const raw = sessionValue ?? localValue;

      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        setHistory(normalizeHistory(parsed).slice(0, MAX_HISTORY_LENGTH));
      }

      if (localValue) {
        // 轉移舊版的 localStorage 紀錄至 sessionStorage，避免重複儲存。
        window.localStorage.removeItem(HISTORY_STORAGE_KEY);
      }
    } catch (error) {
      console.error("無法讀取歷史紀錄", error);
    } finally {
      setIsHistoryLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isHistoryLoaded || typeof window === "undefined") {
      return;
    }
    // 僅在載入完成後同步最新的歷史紀錄至 sessionStorage。
    try {
      window.sessionStorage.setItem(
        HISTORY_STORAGE_KEY,
        JSON.stringify(history.slice(0, MAX_HISTORY_LENGTH)),
      );
    } catch (error) {
      console.error("無法儲存歷史紀錄", error);
    }
  }, [history, isHistoryLoaded]);

  const handleCalculate = useCallback(() => {
    const parsedHeight = parseFloat(height);
    const parsedWeight = parseFloat(weight);

    // 若輸入值不是有效數字則清除結果，避免顯示過期資料。
    if (!parsedHeight || !parsedWeight) {
      setResult(null);
      return;
    }

    const meter = parsedHeight / 100;
    const bmiValue = parsedWeight / (meter * meter);
    // 四捨五入至小數第二位，與 UI 顯示保持一致。
    const bmiRounded = Math.round(bmiValue * 100) / 100;
    const bmiLevel = determineLevel(bmiRounded);
    const { color, description } =
      BMI_SETTINGS[bmiLevel === -1 ? BMI_SETTINGS.length - 1 : bmiLevel];

    const newResult: BMIResult = {
      bmi: bmiRounded.toString(),
      bmiLevel: bmiLevel === -1 ? BMI_SETTINGS.length - 1 : bmiLevel,
      color,
      description,
      height: height.trim(),
      weight: weight.trim(),
    };

    setResult(newResult);
  }, [height, weight]);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      // submit 事件主要來自於「看結果」按鈕。
      handleCalculate();
    },
    [handleCalculate],
  );

  const handleSave = useCallback(() => {
    if (!result) {
      return;
    }

    // 以 randomUUID 優先產生唯一 ID，回退至 timestamp+隨機字串。
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const date = new Date().toLocaleString();

    const record: BMIHistoryRecord = {
      ...result,
      id,
      date,
    };

    setHistory((previous) => [record, ...previous].slice(0, MAX_HISTORY_LENGTH));
  }, [result]);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    if (typeof window !== "undefined") {
      // 同步清除瀏覽器儲存，避免重新載入後紀錄又出現。
      window.sessionStorage.removeItem(HISTORY_STORAGE_KEY);
    }
  }, []);

  const handleDeleteRecord = useCallback((id: string) => {
    // 使用純函式方式刪除指定 ID 的紀錄，確保 state 更新正確。
    setHistory((previous) => previous.filter((record) => record.id !== id));
  }, []);

  // 頁首圖示使用 useMemo 避免在每次 render 時重新建立物件。
  const headerIconStyle = useMemo(
    () => ({ backgroundImage: "url('/img/BMICLogo.png')" }),
    []
  );

  return (
    <article className="flex w-full flex-col items-center">
      <header className="w-full bg-[#424242] text-white">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-6 py-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:items-center lg:gap-8 lg:text-left">
            <div
              className="h-[88px] w-[88px] flex-shrink-0 bg-contain bg-no-repeat sm:h-[104px] sm:w-[104px] lg:h-[117px] lg:w-[117px]"
              style={headerIconStyle}
              aria-hidden="true"
            />
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold sm:text-3xl">BMI 計算器</h1>
              <p className="text-base text-[#FFD366] sm:text-lg">輸入身高與體重立即取得 BMI 指標</p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mx-auto w-full max-w-xl space-y-6 rounded-3xl bg-[rgba(0,0,0,0.35)] p-6 backdrop-blur-sm sm:p-8 lg:mx-0"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <InputField
                id="height"
                label="身高 cm"
                value={height}
                placeholder="請在此輸入身高"
                onChange={setHeight}
              />
              <InputField
                id="weight"
                label="體重 kg"
                value={weight}
                placeholder="請在此輸入體重"
                onChange={setWeight}
              />
            </div>
            <div className="flex items-center justify-center">
              {result ? (
                <ResultDisplay
                  result={result}
                  onRecalculate={handleCalculate}
                  onSave={handleSave}
                />
              ) : (
                <button
                  type="submit"
                  className="flex h-28 w-28 cursor-pointer select-none items-center justify-center rounded-full bg-[#FFD366] text-xl font-medium text-[#424242] transition hover:shadow-[0_1px_6px_3px_rgba(255,195,49,0.64)] active:bg-[#DEA921] sm:text-2xl"
                >
                  看結果
                </button>
              )}
            </div>
          </form>
        </div>
      </header>

      <section className="w-full bg-white">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-12">
          <div className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <h2 className="text-2xl font-semibold text-[#424242]">BMI 換算紀錄</h2>
            <button
              type="button"
              onClick={handleClearHistory}
              className="cursor-pointer rounded-full border border-[#333029] bg-[#FFD466] px-6 py-2 text-base font-medium text-[#424242] transition hover:bg-[#DEA821] active:translate-y-[1px]"
            >
              清除換算紀錄
            </button>
          </div>
          <div className="mt-8 w-full overflow-x-auto">
            <HistoryList records={history} onDelete={handleDeleteRecord} />
          </div>
        </div>
      </section>
    </article>
  );
}
