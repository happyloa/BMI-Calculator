import { BMIResult } from "@/types/bmi";

interface ResultDisplayProps {
  result: BMIResult;
  onRecalculate: () => void;
  onSave: () => void;
}

const actionButtonBase =
  "absolute bottom-[6px] h-[30px] w-[30px] cursor-pointer rounded-full border-2 border-[#424242] bg-no-repeat bg-center outline-none transition hover:border-white hover:shadow-[0_1px_6px_3px_#ffffff] active:border-[#888888] active:shadow-[0_1px_6px_3px_#888888]";

export default function ResultDisplay({
  result,
  onRecalculate,
  onSave,
}: ResultDisplayProps) {
  return (
    <div
      className="relative flex items-center text-[32px]"
      style={{ color: result.color }}
    >
      <div
        className="flex h-[120px] w-[120px] items-center justify-center rounded-full border-[6px]"
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
      <div className="ml-[18px] text-[32px]">{result.description}</div>
      <button
        type="button"
        aria-label="重新計算 BMI"
        className={`${actionButtonBase} left-[88px] bg-[url('/img/icons_loop.png')] hover:animate-spin-slow`}
        style={{ backgroundColor: result.color }}
        onClick={onRecalculate}
      />
      <button
        type="button"
        aria-label="儲存換算結果"
        className={`${actionButtonBase} left-[128px] bg-[url('/img/save.svg')] hover:animate-spin-slow`}
        style={{ backgroundColor: result.color }}
        onClick={onSave}
      />
    </div>
  );
}
