"use client";

import { type FormEvent, useState } from "react";
import HistoryList from "@/components/HistoryList";
import InputField from "@/components/InputField";
import ResultDisplay from "@/components/ResultDisplay";
import { calculateBMI } from "@/lib/bmi";
import { useBMIHistory } from "@/hooks/useBMIHistory";
import type { BMIHistoryRecord, BMIResult } from "@/types/bmi";

export default function BMICalculator() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState<BMIResult | null>(null);
  const { records: history, warning, saveRecord, deleteRecord, clearHistory } = useBMIHistory();
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const calculated = calculateBMI(height, weight);
    setResult(calculated);
    setError(calculated ? "" : "請輸入大於 0 的有效身高與體重。");
  }

  function changeHeight(value: string) {
    setHeight(value);
    setResult(null);
    setError("");
  }

  function changeWeight(value: string) {
    setWeight(value);
    setResult(null);
    setError("");
  }

  function handleSave() {
    if (!result) return;
    const record: BMIHistoryRecord = {
      ...result,
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      date: new Date().toLocaleString("zh-TW"),
    };
    saveRecord(record);
  }

  return (
    <article className="flex w-full flex-col items-center">
      <header className="w-full bg-[#424242] text-white">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-6 py-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:items-center lg:gap-8 lg:text-left">
            <div
              className="h-[88px] w-[88px] flex-shrink-0 bg-contain bg-no-repeat sm:h-[104px] sm:w-[104px] lg:h-[117px] lg:w-[117px]"
              style={{ backgroundImage: "url('/img/BMICLogo.png')" }}
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
                onChange={changeHeight}
              />
              <InputField
                id="weight"
                label="體重 kg"
                value={weight}
                placeholder="請在此輸入體重"
                onChange={changeWeight}
              />
            </div>
            {error && <p role="alert" className="text-white">{error}</p>}
            <div className="flex items-center justify-center" aria-live="polite">
              {result ? (
                <ResultDisplay
                  result={result}
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
              onClick={clearHistory}
              className="cursor-pointer rounded-full border border-[#333029] bg-[#FFD466] px-6 py-2 text-base font-medium text-[#424242] transition hover:bg-[#DEA821] active:translate-y-[1px]"
            >
              清除換算紀錄
            </button>
          </div>
          {warning && <p role="status" className="mt-4 text-center text-[#424242]">{warning}</p>}
          <div className="mt-8 w-full overflow-x-auto">
            <HistoryList records={history} onDelete={deleteRecord} />
          </div>
        </div>
      </section>
    </article>
  );
}
