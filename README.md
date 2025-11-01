# BMI 計算器

以 Next.js 16 打造的單頁式 BMI 計算器，提供使用者輸入身高、體重後立即得到 BMI 結果，並支援儲存歷史紀錄、重新計算等操作。介面採 Tailwind CSS 4 與 React 19 的最新組合，並以 TypeScript 確保程式碼型別安全。

## 技術堆疊與版本
- **Next.js** 16.0.1
- **React** 19.2.0
- **React DOM** 19.2.0
- **TypeScript** 5.9.3
- **Tailwind CSS** 4.1.16（搭配 `@tailwindcss/postcss` 4.1.16 與 PostCSS 8.5.6）
- **ESLint** 9.38.0（含 `eslint-config-next` 16.0.1）

> 建議使用 Node.js 18.18 以上版本，以符合 Next.js 16 的最低需求。

## 快速開始
1. 安裝相依套件：
   ```bash
   npm install
   ```
2. 啟動開發伺服器：
   ```bash
   npm run dev
   ```
   預設會開啟於 <http://localhost:3000>。
3. 建置正式版：
   ```bash
   npm run build
   ```
4. 以正式模式啟動伺服器（需先執行 `npm run build`）：
   ```bash
   npm run start
   ```
5. 進行程式碼檢查：
   ```bash
   npm run lint
   ```

## 專案結構
```
app/
  layout.tsx        # 全域版面與 HTML 結構
  page.tsx          # 入口頁面，串接 BMI 計算器與頁腳
  globals.css       # 全域樣式與 Tailwind 設定
components/
  BMICalculator.tsx # 主要互動邏輯，處理計算與歷史紀錄
  HistoryList.tsx   # BMI 歷史紀錄表格
  InputField.tsx    # 共用的身高、體重輸入欄位
  ResultDisplay.tsx # 顯示 BMI 結果與操作按鈕
  Footer.tsx        # 版面底部資訊
public/
  img/              # 標誌與操作圖示資源
```

## 功能亮點
- 依照台灣常見分級呈現 BMI 狀態、顏色指示與資訊文字。
- 使用 `sessionStorage` 儲存最近 15 筆換算紀錄，並具備清除或刪除單筆的功能。
- 透過 Tailwind CSS Utility 類別快速建立 RWD 頁面，並加入自訂動畫變數。
- TypeScript 型別定義 (`types/bmi.ts`) 協助維持元件間資料結構一致性。

## 發布與部署建議
- 建議於 CI/CD 管線中執行 `npm run lint` 與 `npm run build`，確保程式碼品質。
- 可搭配 Vercel 或任何支援 Next.js 16 的 Node.js 平台部署。

