import { BMIHistoryRecord } from "@/types/bmi";

interface HistoryListProps {
  records: BMIHistoryRecord[];
}

const flagStyles = [
  "bg-[#31BAF9] shadow-[2px_0_3px_0_rgba(49,186,249,0.29)]",
  "bg-[#86D73E] shadow-[2px_0_3px_0_rgba(133,215,63,0.29)]",
  "bg-[#FF982D] shadow-[2px_0_3px_0_rgba(255,152,45,0.29)]",
  "bg-[#FF1200] shadow-[2px_0_3px_0_rgba(255,17,0,0.29)]",
];

export default function HistoryList({ records }: HistoryListProps) {
  if (records.length === 0) {
    return (
      <p className="mt-8 text-center text-lg text-[#4A4A4A]">
        目前沒有換算紀錄，計算完成後可以儲存結果。
      </p>
    );
  }

  return (
    <ul className="mt-5 mb-[58px] flex w-full max-w-[960px] flex-col select-none">
      {records.map((record) => (
        <li
          key={record.id}
          className="mx-4 my-4 flex h-[62px] items-center justify-between bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.2)] transition hover:shadow-[0_1px_3px_0_rgba(0,0,0,0.5)] active:shadow-[0_1px_3px_0_rgba(0,0,0,0.9)]"
        >
          <span className={`h-full w-[0.4375rem] ${flagStyles[record.bmiLevel]}`} />
          <span className="flex w-[20%] justify-center px-5 text-xl text-[#4A4A4A]">
            {record.description}
          </span>
          <span className="flex w-[20%] items-center justify-center px-5 text-xl text-[#4A4A4A]">
            <span className="mr-1 text-sm text-[#424242]">BMI</span>
            {record.bmi}
          </span>
          <span className="flex w-[20%] items-center justify-center px-5 text-xl text-[#4A4A4A]">
            <span className="mr-1 text-sm text-[#424242]">weight</span>
            {record.weight}kg
          </span>
          <span className="flex w-[20%] items-center justify-center px-5 text-xl text-[#4A4A4A]">
            <span className="mr-1 text-sm text-[#424242]">height</span>
            {record.height}
          </span>
          <span className="w-[20%] px-5 text-right text-xl text-[#4A4A4A]">
            <span className="text-sm text-[#424242]">{record.date}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
