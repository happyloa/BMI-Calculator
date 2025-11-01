import { BMIResult } from "@/types/bmi";

interface ResultDisplayProps {
  result: BMIResult;
  onRecalculate: () => void;
  onSave: () => void;
}

const actionButtonBase =
  "flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-full border-2 border-[#424242] bg-center bg-no-repeat outline-none transition hover:border-white hover:shadow-[0_1px_6px_3px_#ffffff] active:border-[#888888] active:shadow-[0_1px_6px_3px_#888888]";

export default function ResultDisplay({
  result,
  onRecalculate,
  onSave,
}: ResultDisplayProps) {
  return (
    <div
      className="flex flex-col items-center gap-6 text-center text-[32px] sm:flex-row sm:items-center sm:justify-center sm:gap-8 sm:text-left"
      style={{ color: result.color }}
    >
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div
          className="flex size-[120px] shrink-0 items-center justify-center rounded-full border-[6px]"
          style={{
            borderColor: result.color,
            boxShadow: `0 1px 6px 3px ${result.color} inset`,
          }}
        >
          <div className="text-center text-[32px] leading-none">
            <div>{result.bmi}</div>
            <div className="text-sm">BMI</div>
          </div>
        </div>
        <p className="text-[32px] font-medium">{result.description}</p>
      </div>
      <div className="flex items-center gap-3">
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
  );
}
