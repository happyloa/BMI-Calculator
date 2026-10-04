# BMI 計算器

輸入身高（公分）與體重（公斤），計算 BMI、查看體位分級，並手動儲存最近 15 筆結果。專案使用 Next.js App Router，計算與歷史紀錄都在瀏覽器端處理。

## 環境與套件

使用 Node.js 24 LTS（24.13.0 以上、低於 25）與 npm 11（11.19.0 以上、低於 12）。`.nvmrc` 指定 Node.js 24，完整依賴版本由 `package-lock.json` 固定。

| 套件 | 版本 |
| --- | --- |
| Next.js / eslint-config-next | 16.3.8 |
| React / React DOM | 19.3.0 |
| TypeScript | 6.0.3 |
| Tailwind CSS / @tailwindcss/postcss | 4.3.3 |
| PostCSS | 8.5.28 |
| ESLint | 9.39.5 |
| Playwright | 1.63.0 |

TypeScript 保留在 6.0.3，因為 [typescript-eslint 支援範圍](https://typescript-eslint.io/users/dependency-versions/)尚未涵蓋 TypeScript 7。`next.config.ts` 使用 TypeScript API 執行建置型別檢查。ESLint 保留在 9.39.5，因為目前 Next.js 使用的 React 與 JSX 無障礙插件尚未宣告支援 ESLint 10；這是相容性限制，ESLint 9 本身已結束官方支援。Node.js 型別套件維持 24 系列，與執行環境一致。

## 快速開始

第一次取得專案或依 lockfile 重建環境時：

```bash
npm ci
npm run dev
```

開發網址為 <http://localhost:3000>。新增或更新套件時可使用 `npm install`，並一起提交 `package.json` 與 `package-lock.json`。

正式模式需先建置：

```bash
npm run build
npm run start
```

## 功能與紀錄保存

BMI 公式為體重（公斤）除以身高（公尺）的平方。結果四捨五入到小數第二位；體位分級依未四捨五入的數值判斷，避免邊界附近的數值被分到下一級。

分級採[國民健康署成人健康體位標準](https://www.hpa.gov.tw/Pages/Detail.aspx?nodeid=542&pid=9737&sid=705)：過輕為 BMI < 18.5，理想為 18.5 ≤ BMI < 24，過重為 24 ≤ BMI < 27，肥胖為 BMI ≥ 27。此分級適用於成人，兒童與青少年的標準不同。

身高與體重支援小數，必須是大於 0 的有限數值。修改輸入後會清除舊結果，重新計算才能儲存，避免把舊結果誤當成新輸入的換算值。

按下儲存按鈕後，結果才會加入歷史紀錄。紀錄由新到舊排列，最多保留 15 筆，可刪除單筆或全部清除。資料存在該分頁的 `sessionStorage`，重新整理仍會保留，關閉分頁後通常會清除。專案沒有帳號、後端資料庫或跨裝置同步。

舊版 `localStorage` 紀錄會在沒有現有 session 紀錄時載入，成功寫入 `sessionStorage` 後才移除原始資料。無效紀錄會略過；JSON 損壞或儲存權限被封鎖時，畫面會顯示提示，計算器仍可使用。無法寫入瀏覽器儲存時，新紀錄只保留在目前頁面的記憶體中。

介面以 Tailwind CSS 排版，支援手機與桌面；歷史表格在窄螢幕可水平捲動。中文字型使用 Google Fonts 的 Noto Sans TC，無法連線時會退回系統字型。

## 驗證

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

也可一次執行以上檢查：

```bash
npm run verify
```

瀏覽器測試會啟動正式版伺服器，因此需先完成建置：

```bash
npx playwright install chromium
npm run test:e2e
```

Playwright 使用桌面 Chromium 與手機尺寸的 Chromium，測試小數輸入、失效結果、紀錄上限、重新載入、刪除、清空、舊資料轉移及儲存失敗。手機測試是瀏覽器模擬，沒有驗證實體手機或 Safari。

## 安全檢查與已知限制

```bash
npm audit
npm audit --omit=dev
```

本次更新後，正式依賴的 audit 結果為 0 項漏洞；完整依賴仍有 5 項 high 警告，全部來自開發工具的同一條依賴鏈：`eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces`。[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) 影響 braces 3.0.3 及更早版本，目前沒有官方修補版本。

此依賴用於 ESLint 的專案路徑 glob 解析，本專案未設定來自使用者輸入的 glob。它仍是尚未修補的開發依賴，不應把完整 audit 宣稱為零漏洞。上游修補後需更新 lockfile 並重跑驗證；`npm audit fix --force` 目前會將 Next.js lint 設定降回 14，請勿直接執行。

`package.json` 明確停用 `unrs-resolver` 的 postinstall 腳本；resolver 使用 npm 安裝的可選原生 binding。乾淨安裝後須確認 lint 可以執行。

## 專案結構

```text
app/
  layout.tsx        # 全域版面、語系與頁面資訊
  page.tsx          # 首頁與頁腳
  globals.css       # Tailwind 與字型設定
components/
  BMICalculator.tsx # 輸入、換算與儲存操作
  HistoryList.tsx   # 歷史紀錄表格
  InputField.tsx    # 身高與體重欄位
  ResultDisplay.tsx # BMI 結果與操作按鈕
  Footer.tsx        # 作者資訊
hooks/
  useBMIHistory.ts  # session 紀錄、舊資料轉移與儲存錯誤提示
lib/
  bmi.ts            # 計算、分級與紀錄驗證
types/
  bmi.ts            # 結果與歷史紀錄型別
public/img/         # 標誌與操作圖示
tests/             # Node.js 回歸測試
e2e/               # Playwright 瀏覽器測試
.github/workflows/ci.yml # 自動驗證
```

## CI 與部署

GitHub Actions 在推送 `main` 或建立 pull request 時執行乾淨安裝、正式依賴 audit、lint、型別檢查、回歸測試、正式建置與瀏覽器測試。CI 使用 Node.js 24 與固定的 npm 版本，Action 也固定到 commit。

Repository 首頁網址為 [Cloudflare Pages 上的計算器](https://bmi-calculator-cww.pages.dev)。[GitHub Pages](https://happyloa.github.io/BMI-Calculator/) 另外透過平台的 Jekyll 工作流程發布文件頁，沒有執行 Next.js 應用程式。Repository 中未提供 Cloudflare 部署設定，因此 CI 通過與推送成功仍需搭配正式環境的部署紀錄，才能確認線上版本已更新。

如需自行部署，可使用 Vercel 或支援此 Next.js 版本的 Node.js 平台。自行執行伺服器時，使用前述 `npm run build` 與 `npm run start`。
