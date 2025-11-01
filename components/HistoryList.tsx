import { BMIHistoryRecord } from "@/types/bmi";

interface HistoryListProps {
  records: BMIHistoryRecord[];
  onDelete: (id: string) => void;
}

const flagStyles = [
  { className: "shadow-[2px_0_3px_0_rgba(49,186,249,0.29)]", fallback: "#31BAF9" },
  { className: "shadow-[2px_0_3px_0_rgba(133,215,63,0.29)]", fallback: "#86D73E" },
  { className: "shadow-[2px_0_3px_0_rgba(255,152,45,0.29)]", fallback: "#FF982D" },
  { className: "shadow-[2px_0_3px_0_rgba(255,17,0,0.29)]", fallback: "#FF1200" },
];

export default function HistoryList({ records, onDelete }: HistoryListProps) {
  if (records.length === 0) {
    return (
      <p className="py-8 text-center text-lg text-[#4A4A4A]">
        目前沒有換算紀錄，計算完成後可以儲存結果。
      </p>
    );
  }

  return (
    <table className="min-w-full select-none overflow-hidden rounded-3xl bg-white text-left shadow-[0_1px_3px_0_rgba(0,0,0,0.15)]">
      <caption className="sr-only">BMI 換算紀錄清單</caption>
      <thead className="bg-[#FFD366]/60 text-sm uppercase tracking-wide text-[#424242]">
        <tr>
          <th scope="col" className="w-2" aria-label="顏色指標" />
          <th scope="col" className="px-4 py-3 text-center">狀態</th>
          <th scope="col" className="px-4 py-3 text-center">BMI</th>
          <th scope="col" className="px-4 py-3 text-center">體重 (kg)</th>
          <th scope="col" className="px-4 py-3 text-center">身高 (cm)</th>
          <th scope="col" className="px-4 py-3 text-center">紀錄時間</th>
          <th scope="col" className="px-4 py-3 text-center">操作</th>
        </tr>
      </thead>
      <tbody>
        {records.map((record) => (
          <tr
            key={record.id}
            className="border-t border-[#E5E5E5] text-base text-[#4A4A4A] transition hover:bg-[#FFF5D9]"
          >
            <td className="align-middle">
              {(() => {
                const flag = flagStyles[record.bmiLevel] ?? flagStyles[1];
                return (
                  <span
                    className={`block h-full w-1 ${flag.className}`}
                    style={{ backgroundColor: record.color ?? flag.fallback }}
                    aria-hidden="true"
                  />
                );
              })()}
            </td>
            <td className="px-4 py-4 text-center text-lg font-medium">{record.description}</td>
            <td className="px-4 py-4 text-center">
              <span className="mr-1 text-sm text-[#424242]">BMI</span>
              {record.bmi}
            </td>
            <td className="px-4 py-4 text-center">
              <span className="mr-1 text-sm text-[#424242]">weight</span>
              {record.weight}
            </td>
            <td className="px-4 py-4 text-center">
              <span className="mr-1 text-sm text-[#424242]">height</span>
              {record.height}
            </td>
            <td className="px-4 py-4 text-center text-sm text-[#424242]">{record.date}</td>
            <td className="px-4 py-4 text-center">
              <button
                type="button"
                onClick={() => onDelete(record.id)}
                className="rounded-full border border-[#C14646] px-4 py-1 text-sm text-[#C14646] transition hover:bg-[#C14646] hover:text-white"
              >
                刪除
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
