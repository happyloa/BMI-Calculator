export interface BMIResult {
  bmi: string;
  bmiLevel: number;
  color: string;
  description: string;
  height: string;
  weight: string;
}

export interface BMIHistoryRecord extends BMIResult {
  id: string;
  date: string;
}
