// 單次 BMI 計算的結果，用於畫面呈現與資料儲存。
export interface BMIResult {
  bmi: string;
  bmiLevel: number;
  color: string;
  description: string;
  height: string;
  weight: string;
}

// 歷史紀錄在 BMIResult 基礎上增加唯一識別與紀錄時間。
export interface BMIHistoryRecord extends BMIResult {
  id: string;
  date: string;
}
