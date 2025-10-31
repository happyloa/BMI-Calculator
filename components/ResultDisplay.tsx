import { BMIResult } from "@/types/bmi";

interface ResultDisplayProps {
  result: BMIResult;
  onRecalculate: () => void;
  onSave: () => void;
}

const actionButtonBase =
  "flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full border-2 border-[#424242] bg-center bg-no-repeat outline-none transition hover:border-white hover:shadow-[0_1px_6px_3px_#ffffff] active:border-[#888888] active:shadow-[0_1px_6px_3px_#888888]";

export default function ResultDisplay({
  result,
  onRecalculate,
  onSave,
}: ResultDisplayProps) {
  return (
    <div
      className="flex w-full max-w-xs flex-col items-center gap-4 text-center text-[32px] lg:max-w-none lg:flex-row lg:items-center lg:gap-6 lg:text-left"
      style={{ color: result.color }}
    >
      <div
        className="flex aspect-square w-[120px] items-center justify-center rounded-full border-[6px]"
        style={{
          borderColor: result.color,
          boxShadow: `0 1px 6px 3px ${result.color} inset`,
        }}
      >
        <div className="text-center leading-none">
          <div>{result.bmi}</div>
          <div className="text-sm">BMI</div>
        </div>
      </div>
      <div className="text-2xl font-medium lg:text-[32px]">{result.description}</div>
      <div className="flex gap-3">
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
