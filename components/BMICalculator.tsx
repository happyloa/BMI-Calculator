"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import HistoryList from "@/components/HistoryList";
import InputField from "@/components/InputField";
import ResultDisplay from "@/components/ResultDisplay";
import { BMIHistoryRecord, BMIResult } from "@/types/bmi";

const BMI_SETTINGS = [
  { maxBMI: 18.5, color: "#31BAF9", description: "過輕" },
  { maxBMI: 24, color: "#86D73E", description: "理想" },
  { maxBMI: 27, color: "#FF982D", description: "過重" },
  { maxBMI: Number.POSITIVE_INFINITY, color: "#FF1200", description: "肥胖" },
] as const;

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

function determineLevel(bmi: number): number {
  return BMI_SETTINGS.findIndex((setting) => bmi < setting.maxBMI);
}

export default function BMICalculator() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState<BMIResult | null>(null);
  const [history, setHistory] = useState<BMIHistoryRecord[]>([]);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
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

    if (!parsedHeight || !parsedWeight) {
      setResult(null);
      return;
    }

    const meter = parsedHeight / 100;
    const bmiValue = parsedWeight / (meter * meter);
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
      handleCalculate();
    },
    [handleCalculate],
  );

  const handleSave = useCallback(() => {
    if (!result) {
      return;
    }

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
      window.sessionStorage.removeItem(HISTORY_STORAGE_KEY);
    }
  }, []);

  const handleDeleteRecord = useCallback((id: string) => {
    setHistory((previous) => previous.filter((record) => record.id !== id));
  }, []);

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
              className="rounded-full border border-[#333029] bg-[#FFD466] px-6 py-2 text-base font-medium text-[#424242] transition hover:bg-[#DEA821] active:translate-y-[1px]"
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
