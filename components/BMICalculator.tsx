"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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
      const session = window.sessionStorage;
      const raw = session.getItem(HISTORY_STORAGE_KEY);

      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        setHistory(normalizeHistory(parsed));
      } else {
        const legacyRaw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
        if (legacyRaw) {
          const parsed = JSON.parse(legacyRaw) as unknown;
          const normalized = normalizeHistory(parsed);
          setHistory(normalized);
          session.setItem(HISTORY_STORAGE_KEY, JSON.stringify(normalized));
          window.localStorage.removeItem(HISTORY_STORAGE_KEY);
        }
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
        JSON.stringify(history),
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

    setHistory((previous) => [record, ...previous]);
  }, [result]);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(HISTORY_STORAGE_KEY);
      window.localStorage.removeItem(HISTORY_STORAGE_KEY);
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
    <div className="flex w-full flex-col items-center">
      <header className="w-full bg-[#424242]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-6 py-10 text-white lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:py-[72px]">
          <div className="flex w-full flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-[97px]">
            <div
              className="h-[96px] w-[96px] bg-contain bg-no-repeat lg:h-[117px] lg:w-[117px]"
              style={headerIconStyle}
              aria-hidden="true"
            />
            <div className="w-full max-w-md space-y-6 lg:max-w-[260px] lg:space-y-8">
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
          </div>
          <div className="flex w-full justify-center lg:w-auto lg:justify-end">
            {result ? (
              <ResultDisplay
                result={result}
                onRecalculate={handleCalculate}
                onSave={handleSave}
              />
            ) : (
              <button
                type="button"
                className="flex aspect-square w-[120px] cursor-pointer select-none items-center justify-center rounded-full bg-[#FFD366] text-2xl text-[#424242] shadow-[0_1px_6px_0_rgba(0,0,0,0.25)] transition hover:shadow-[0_1px_6px_3px_rgba(255,195,49,0.64)] active:bg-[#DEA921]"
                onClick={handleCalculate}
              >
                看結果
              </button>
            )}
          </div>
        </div>
      </header>

      <section className="flex w-full flex-col items-center px-4 pb-16">
        <h2 className="mt-12 text-2xl text-[#424242]">BMI 換算紀錄</h2>
        <button
          type="button"
          onClick={handleClearHistory}
          className="mt-6 cursor-pointer rounded-[24px] border border-[#333029] bg-[#FFD466] px-[22px] py-[12px] text-lg text-[#424242] transition hover:bg-[#DEA821] active:translate-y-[1px]"
        >
          清除換算紀錄
        </button>
        <div className="flex w-full justify-center">
          <HistoryList records={history} onDelete={handleDeleteRecord} />
        </div>
      </section>
    </div>
  );
}
