# BMI 計算器

使用 Next.js 16 與 Tailwind CSS 4 打造的現代化 BMI 計算器，重現原始設計並加入完整的元件化與響應式排版調整。使用者可以快速換算 BMI、儲存結果，並在不同尺寸的裝置上享受一致的操作體驗。

## 功能特色

- 🎯 **即時計算**：輸入身高、體重後即可顯示 BMI 指數與體位分類。
- 💾 **歷程保存**：結果儲存在瀏覽器 `sessionStorage` 中，並可個別刪除或一次清空。
- 📱 **完整 RWD**：排版會依據螢幕寬度自動調整，手機、平板與桌機皆易於操作。
- 🎨 **Tailwind CSS 4**：採用最新的原子化樣式設計，保留原始視覺風格並優化維護性。

## 專案結構

- `app/` – Next.js App Router 入口與全域樣式。
- `components/` – 拆分的 UI 元件（輸入欄位、結果區塊、歷史紀錄、頁尾）。
- `types/` – 共享的 TypeScript 型別定義。

## 開發指南

1. 安裝套件：
   ```bash
   npm install
   ```
2. 啟動開發伺服器：
   ```bash
   npm run dev
   ```
   依照終端機輸出的網址開啟瀏覽器即可預覽（預設為 http://localhost:3000）。
3. 程式碼檢查：
   ```bash
   npm run lint
   ```

## 部署建議

部署至 Vercel 時無須額外設定；若使用自架環境，請確保 Node.js 18.18 以上並執行 `npm run build` 與 `npm start`。

---

如需進一步調整或擴充功能，歡迎建立 Issue 或 Pull Request！
