import { BMIHistoryRecord } from "@/types/bmi";

interface HistoryListProps {
  records: BMIHistoryRecord[];
  onDeleteRecord: (id: string) => void;
}

const flagStyles = [
  "bg-[#31BAF9] shadow-[2px_0_3px_0_rgba(49,186,249,0.29)]",
  "bg-[#86D73E] shadow-[2px_0_3px_0_rgba(133,215,63,0.29)]",
  "bg-[#FF982D] shadow-[2px_0_3px_0_rgba(255,152,45,0.29)]",
  "bg-[#FF1200] shadow-[2px_0_3px_0_rgba(255,17,0,0.29)]",
];

function resolveFlagClass(level: number): string {
  return flagStyles[level] ?? flagStyles[1];
}

export default function HistoryList({ records, onDeleteRecord }: HistoryListProps) {
  if (records.length === 0) {
    return (
      <p className="mt-8 text-center text-lg text-[#4A4A4A]">
        目前沒有換算紀錄，計算完成後可以儲存結果。
      </p>
    );
  }

  return (
    <ul className="mb-14 mt-5 flex w-full max-w-5xl flex-col gap-4 px-4">
      {records.map((record) => (
        <li
          key={record.id}
          className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.2)] transition hover:shadow-[0_1px_6px_0_rgba(0,0,0,0.35)] sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3 sm:w-48">
            <span
              className={`block h-10 w-2 rounded-full sm:h-12 ${resolveFlagClass(record.bmiLevel)}`}
              aria-hidden="true"
            />
            <p className="text-xl font-medium text-[#4A4A4A]">{record.description}</p>
          </div>
          <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-2 text-sm text-[#4A4A4A] sm:grid-cols-4 sm:text-base">
            <div className="flex items-baseline gap-1">
              <dt className="text-xs uppercase tracking-wide text-[#424242]">BMI</dt>
              <dd className="text-lg font-medium">{record.bmi}</dd>
            </div>
            <div className="flex items-baseline gap-1">
              <dt className="text-xs uppercase tracking-wide text-[#424242]">weight</dt>
              <dd className="text-lg font-medium">{record.weight}kg</dd>
            </div>
            <div className="flex items-baseline gap-1">
              <dt className="text-xs uppercase tracking-wide text-[#424242]">height</dt>
              <dd className="text-lg font-medium">{record.height}</dd>
            </div>
            <div className="flex items-baseline gap-1">
              <dt className="text-xs uppercase tracking-wide text-[#424242]">日期</dt>
              <dd className="text-sm sm:text-base">
                <time dateTime={record.createdAt}>{record.date}</time>
              </dd>
            </div>
          </dl>
          <div className="flex items-center justify-end gap-3 self-stretch sm:flex-col sm:items-end sm:justify-center sm:self-auto">
            <button
              type="button"
              onClick={() => onDeleteRecord(record.id)}
              className="rounded-full border border-[#FF1200] px-4 py-2 text-sm font-medium text-[#FF1200] transition hover:bg-[#FF1200] hover:text-white"
            >
              刪除
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
