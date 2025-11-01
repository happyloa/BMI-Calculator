// 呈現 BMI 計算結果並提供儲存、重新計算等操作。
import { BMIResult } from "@/types/bmi";

interface ResultDisplayProps {
  result: BMIResult;
  onRecalculate: () => void;
  onSave: () => void;
}

// 基礎按鈕樣式，讓重新計算與儲存共用一致的外觀與互動效果。
const actionButtonBase =
  "flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-[#424242] bg-center bg-no-repeat outline-none transition hover:border-white hover:shadow-[0_1px_6px_3px_#ffffff] active:border-[#888888] active:shadow-[0_1px_6px_3px_#888888]";

export default function ResultDisplay({
  result,
  onRecalculate,
  onSave,
}: ResultDisplayProps) {
  return (
    <figure
      className="flex flex-col items-center gap-4 text-center text-[28px] sm:flex-row sm:items-center sm:gap-6 sm:text-left"
      style={{ color: result.color }}
    >
      <div className="relative flex flex-shrink-0 flex-col items-center">
        <div
          className="flex h-[120px] w-[120px] items-center justify-center rounded-full border-[6px]"
          style={{
            // 利用內外陰影與邊框顏色突顯 BMI 數值。
            borderColor: result.color,
            boxShadow: `0 1px 6px 3px ${result.color} inset`,
          }}
        >
          <div className="text-center text-[32px] leading-none">
            <div>{result.bmi}</div>
            <div className="text-sm">BMI</div>
          </div>
        </div>
        <div className="mt-3 flex gap-3">
          <button
            type="button"
            aria-label="重新計算 BMI"
            className={`${actionButtonBase} bg-[url('/img/icons_loop.png')] hover:animate-spin-slow`}
            style={{ backgroundColor: result.color }}
            onClick={onRecalculate}
          />
          <button
            type="button"
            aria-label="儲存換算結果"
            className={`${actionButtonBase} bg-[url('/img/save.svg')] hover:animate-spin-slow`}
            style={{ backgroundColor: result.color }}
            onClick={onSave}
          />
        </div>
      </div>
      <figcaption className="text-2xl font-semibold sm:text-3xl">
        {result.description}
      </figcaption>
    </figure>
  );
}
