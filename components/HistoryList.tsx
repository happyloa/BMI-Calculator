import { BMIHistoryRecord } from "@/types/bmi";

interface HistoryListProps {
  records: BMIHistoryRecord[];
  onDelete: (id: string) => void;
}

const flagStyles = [
  "bg-[#31BAF9] shadow-[2px_0_3px_0_rgba(49,186,249,0.29)]",
  "bg-[#86D73E] shadow-[2px_0_3px_0_rgba(133,215,63,0.29)]",
  "bg-[#FF982D] shadow-[2px_0_3px_0_rgba(255,152,45,0.29)]",
  "bg-[#FF1200] shadow-[2px_0_3px_0_rgba(255,17,0,0.29)]",
];

export default function HistoryList({ records, onDelete }: HistoryListProps) {
  if (records.length === 0) {
    return (
      <p className="mt-8 text-center text-lg text-[#4A4A4A]">
        目前沒有換算紀錄，計算完成後可以儲存結果。
      </p>
    );
  }

  return (
    <ul className="mt-5 mb-16 flex w-full max-w-6xl flex-col gap-4 px-0 text-[#4A4A4A]">
      {records.map((record) => (
        <li
          key={record.id}
          className="relative mx-0 flex w-full rounded-[20px] bg-white px-5 py-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.2)] transition hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
        >
          <span
            className={`absolute inset-y-0 left-0 w-2 rounded-l-[20px] ${flagStyles[record.bmiLevel]}`}
            aria-hidden="true"
          />
          <div className="grid w-full gap-y-3 pl-4 sm:grid-cols-[repeat(5,minmax(0,1fr))_auto] sm:items-center sm:gap-x-4 sm:pl-6">
            <div className="text-lg font-medium sm:text-xl">{record.description}</div>
            <div className="flex items-center text-base sm:text-xl">
              <span className="mr-1 text-sm text-[#424242]">BMI</span>
              {record.bmi}
            </div>
            <div className="flex items-center text-base sm:text-xl">
              <span className="mr-1 text-sm text-[#424242]">weight</span>
              {record.weight}kg
            </div>
            <div className="flex items-center text-base sm:text-xl">
              <span className="mr-1 text-sm text-[#424242]">height</span>
              {record.height}
            </div>
            <div className="flex items-center text-sm text-[#424242] sm:justify-end sm:text-base">
              {record.date}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onDelete(record.id)}
                className="rounded-full border border-transparent bg-[#FFD466] px-4 py-2 text-sm text-[#424242] transition hover:bg-[#DEA821] active:translate-y-[1px]"
              >
                刪除
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
