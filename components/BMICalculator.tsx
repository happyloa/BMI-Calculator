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

const HEADER_ICON_STYLE = Object.freeze({
  backgroundImage: "url('/img/BMICLogo.png')",
});

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

function resolveColor(level: number): { color: string; description: string } {
  const fallback = BMI_SETTINGS[BMI_SETTINGS.length - 1];
  const setting = BMI_SETTINGS[level] ?? fallback;
  return {
    color: setting.color,
    description: setting.description,
  };
}

function normalizeHistory(value: unknown): BMIHistoryRecord[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item !== "object" || item === null) {
          return null;
        }

        const rawItem = item as Record<string, unknown>;
        const id = typeof rawItem.id === "string" ? rawItem.id : null;
        const date = typeof rawItem.date === "string" ? rawItem.date : null;
        const bmiValue =
          typeof rawItem.bmi === "string"
            ? rawItem.bmi
            : typeof rawItem.bmi === "number"
              ? rawItem.bmi.toString()
              : null;
        const heightValue =
          typeof rawItem.height === "string"
            ? rawItem.height
            : typeof rawItem.height === "number"
              ? rawItem.height.toString()
              : "";
        const weightValue =
          typeof rawItem.weight === "string"
            ? rawItem.weight
            : typeof rawItem.weight === "number"
              ? rawItem.weight.toString()
              : "";

        if (!id || !date || !bmiValue) {
          return null;
        }

        const levelFromItem =
          typeof rawItem.bmiLevel === "number"
            ? rawItem.bmiLevel
            : determineLevel(parseFloat(bmiValue));
        const normalizedLevel =
          levelFromItem >= 0 && levelFromItem < BMI_SETTINGS.length
            ? levelFromItem
            : BMI_SETTINGS.length - 1;
        const { color, description } = resolveColor(normalizedLevel);
        const createdAtSource =
          typeof rawItem.createdAt === "string" ? rawItem.createdAt : date;
        const createdAtDate = new Date(createdAtSource);

        return {
          id,
          date,
          createdAt: Number.isNaN(createdAtDate.getTime())
            ? new Date().toISOString()
            : createdAtDate.toISOString(),
          bmi: bmiValue,
          bmiLevel: normalizedLevel,
          color,
          description,
          height: heightValue,
          weight: weightValue,
        } satisfies BMIHistoryRecord;
      })
      .filter((item): item is BMIHistoryRecord => Boolean(item))
      .slice(0, 15);
  }

  if (typeof value === "object" && value !== null) {
    const legacy = value as LegacyHistory;
    if (typeof legacy.maxIdx === "number" && typeof legacy.data === "object") {
      const records: BMIHistoryRecord[] = [];
      for (let index = legacy.maxIdx; index >= 0; index -= 1) {
        const record = legacy.data[String(index)];
        if (!record) continue;
        const normalizedLevel =
          record.bmiLevel >= 0 && record.bmiLevel < BMI_SETTINGS.length
            ? record.bmiLevel
            : BMI_SETTINGS.length - 1;
        const { color, description } = resolveColor(normalizedLevel);
        const createdAtDate = new Date(record.date);

        records.push({
          id: `${index}`,
          bmi: record.bmi,
          bmiLevel: normalizedLevel,
          color,
          description,
          height: record.height,
          weight: record.weight,
          date: record.date,
          createdAt: Number.isNaN(createdAtDate.getTime())
            ? new Date().toISOString()
            : createdAtDate.toISOString(),
        });
      }
      return records.slice(0, 15);
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
    const loadRecords = (storage: Storage): BMIHistoryRecord[] => {
      const raw = storage.getItem(HISTORY_STORAGE_KEY);
      if (!raw) {
        return [];
      }
      try {
        const parsed = JSON.parse(raw) as unknown;
        return normalizeHistory(parsed);
      } catch (error) {
        console.error("無法解析歷史紀錄", error);
        return [];
      }
    };

    try {
      let records = loadRecords(window.sessionStorage);
      if (records.length === 0) {
        records = loadRecords(window.localStorage);
        if (records.length > 0) {
          window.sessionStorage.setItem(
            HISTORY_STORAGE_KEY,
            JSON.stringify(records),
          );
          window.localStorage.removeItem(HISTORY_STORAGE_KEY);
        }
      }
      setHistory(records);
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
    if (history.length === 0) {
      window.sessionStorage.removeItem(HISTORY_STORAGE_KEY);
      return;
    }
    window.sessionStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify(history.slice(0, 15)),
    );
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
    const createdAt = new Date();

    const record: BMIHistoryRecord = {
      ...result,
      id,
      date: createdAt.toLocaleString(),
      createdAt: createdAt.toISOString(),
    };

    setHistory((previous) => [record, ...previous].slice(0, 15));
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

  const headerIconStyle = useMemo(() => HEADER_ICON_STYLE, []);

  return (
    <article className="flex w-full flex-col items-center">
      <header className="w-full bg-[#424242]">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-6 py-12 text-white sm:px-10 md:flex-row md:items-center md:justify-between">
          <figure className="flex flex-col items-center md:items-start">
            <div
              className="h-[117px] w-[117px] bg-contain bg-no-repeat"
              style={headerIconStyle}
              aria-hidden="true"
            />
            <figcaption className="sr-only">BMI 計算輸入</figcaption>
          </figure>
          <form
            className="flex w-full max-w-xl flex-col gap-8 text-[#FFD366]"
            onSubmit={handleSubmit}
          >
            <fieldset className="grid gap-6 sm:grid-cols-2 sm:gap-8 md:grid-cols-1">
              <legend className="sr-only">輸入身高與體重</legend>
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
            </fieldset>
            <div className="flex justify-center md:justify-start">
              {result ? (
                <ResultDisplay
                  result={result}
                  onRecalculate={handleCalculate}
                  onSave={handleSave}
                />
              ) : (
                <button
                  type="submit"
                  className="flex h-[120px] w-[120px] cursor-pointer select-none items-center justify-center rounded-full bg-[#FFD366] text-2xl text-[#424242] transition hover:shadow-[0_1px_6px_3px_rgba(255,195,49,0.64)] active:bg-[#DEA921]"
                >
                  看結果
                </button>
              )}
            </div>
          </form>
        </div>
      </header>

      <section
        aria-labelledby="history-heading"
        className="flex w-full flex-col items-center px-4 pb-16 pt-12 sm:px-8"
      >
        <div className="flex w-full max-w-5xl flex-col items-center justify-between gap-6 sm:flex-row">
          <h2
            id="history-heading"
            className="text-2xl font-semibold text-[#424242]"
          >
            BMI 換算紀錄
          </h2>
          <button
            type="button"
            onClick={handleClearHistory}
            className="rounded-full border border-[#333029] bg-[#FFD466] px-6 py-3 text-base font-medium text-[#424242] transition hover:bg-[#DEA821] active:translate-y-[1px]"
          >
            清除換算紀錄
          </button>
        </div>
        <div className="mt-6 flex w-full justify-center">
          <HistoryList records={history} onDeleteRecord={handleDeleteRecord} />
        </div>
      </section>
    </article>
  );
}
