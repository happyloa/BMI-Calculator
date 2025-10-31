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
      const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        setHistory(normalizeHistory(parsed));
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
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
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
      window.localStorage.removeItem(HISTORY_STORAGE_KEY);
    }
  }, []);

  const headerIconStyle = useMemo(
    () => ({ backgroundImage: "url('/img/BMICLogo.png')" }),
    []
  );

  return (
    <div className="flex w-full flex-col items-center">
      <header className="flex h-[300px] w-full items-center justify-center bg-[#424242]">
        <div className="flex items-center">
          <div
            className="h-[117px] w-[117px] bg-contain bg-no-repeat"
            style={headerIconStyle}
            aria-hidden="true"
          />
          <div className="ml-[97px] mr-[53px] w-[260px] space-y-8">
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
          <div className="relative flex h-[120px] w-[160px] items-center">
            {result ? (
              <ResultDisplay
                result={result}
                onRecalculate={handleCalculate}
                onSave={handleSave}
              />
            ) : (
              <button
                type="button"
                className="flex h-[120px] w-[120px] cursor-pointer select-none items-center justify-center rounded-full bg-[#FFD366] text-2xl text-[#424242] transition hover:shadow-[0_1px_6px_3px_rgba(255,195,49,0.64)] active:bg-[#DEA921]"
                onClick={handleCalculate}
              >
                看結果
              </button>
            )}
          </div>
        </div>
      </header>

      <section className="flex w-full flex-col items-center">
        <h2 className="mt-12 text-2xl text-[#424242]">BMI 換算紀錄</h2>
        <button
          type="button"
          onClick={handleClearHistory}
          className="mt-6 cursor-pointer rounded-[24px] border border-[#333029] bg-[#FFD466] px-[22px] py-[12px] text-lg text-[#424242] transition hover:bg-[#DEA821] active:translate-y-[1px]"
        >
          清除換算紀錄
        </button>
        <div className="flex w-full justify-center">
          <HistoryList records={history} />
        </div>
      </section>
    </div>
  );
}
