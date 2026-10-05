# BMI 計算器

輸入身高（公分）與體重（公斤），計算 BMI、查看體位分級，並手動儲存最近 15 筆結果。[正式網站](https://bmi-calculator-cww.pages.dev)部署在 Cloudflare Pages。

這是一個原生 HTML、CSS 與 TypeScript 靜態網站。計算與紀錄都在瀏覽器處理，沒有伺服器框架、帳號、後端資料庫或跨裝置同步。

## 環境與依賴

使用 Node.js 24 LTS（24.13.0 以上、低於 25）與 npm 11（11.19.0 以上、低於 12）。`.nvmrc` 指定 Node.js 24，完整依賴版本由 `package-lock.json` 固定。

只保留 5 個直接開發依賴，正式網站不需要 Node.js 伺服器：

| 套件                              | 用途                       | 版本    |
| --------------------------------- | -------------------------- | ------- |
| Vite                              | 開發伺服器、靜態建置與預覽 | 8.3.2   |
| TypeScript                        | 型別檢查                   | 7.0.2   |
| @types/node                       | Node.js 測試與設定檔的型別 | 24.19.1 |
| @playwright/test                  | 瀏覽器回歸測試             | 1.63.0  |
| @fontsource-variable/noto-sans-tc | 隨網站託管繁體中文字型     | 5.3.0   |

## 快速開始

```bash
npm ci
npm run dev
```

開發網址為 <http://localhost:3000>。新增或更新套件時使用 `npm install`，並一起提交 `package.json` 與 `package-lock.json`。

建置與預覽：

```bash
npm run build
npm run preview
```

預覽網址為 <http://127.0.0.1:4173>，產物在 `dist/`。Vite 的 preview 用於本機驗證；部署時直接發布 `dist/` 靜態檔案。

## 功能與紀錄保存

BMI 公式為體重（公斤）除以身高（公尺）的平方。結果四捨五入到小數第二位；體位分級依未四捨五入的數值判斷，避免邊界附近的數值被分到下一級。

分級採[國民健康署成人健康體位標準](https://www.hpa.gov.tw/Pages/Detail.aspx?nodeid=542&pid=9737&sid=705)：過輕為 BMI < 18.5，理想為 18.5 ≤ BMI < 24，過重為 24 ≤ BMI < 27，肥胖為 BMI ≥ 27。此分級適用於成人，兒童與青少年的標準不同。

身高與體重支援小數，必須是大於 0 的有限數值。修改輸入後會清除舊結果，重新計算才能儲存。

按下儲存按鈕後，結果才會加入歷史紀錄。紀錄由新到舊排列，最多保留 15 筆，可刪除單筆或全部清除。資料存在該分頁的 `sessionStorage`，重新整理仍會保留，關閉分頁後通常會清除。

舊版 `localStorage` 紀錄會在沒有現有 session 紀錄時載入，成功寫入 `sessionStorage` 後才移除原始資料。無效紀錄會略過；JSON 損壞或儲存權限被封鎖時，畫面會顯示提示，計算器仍可使用。無法寫入瀏覽器儲存時，新紀錄只保留在目前頁面的記憶體中。

介面支援手機與桌面；歷史表格可水平捲動，也能用鍵盤聚焦操作。文字可選取與複製，反白使用黃色底與深色文字，捲軸使用深色滑塊與淡黃色軌道。高對比模式使用系統顏色，減少動態效果的偏好也會生效。捲軸是否常駐顯示由瀏覽器與作業系統決定。

中文字型使用思源黑體的 Google 版本 Noto Sans TC。兩者的關係可參考 [Adobe 說明](https://blog.adobe.com/en/publish/2021/04/08/source-han-sans-goes-variable)。字型透過 Fontsource 隨網站託管，以 WOFF2 和 Unicode 分段載入；訪客不需連線至 Google Fonts。無法載入時會退回本機思源黑體、微軟正黑體或系統字型。`public/favicon.svg` 是黃黑配色的指標圖示。

## 驗證

```bash
npm run verify
npx playwright install chromium
npm run test:e2e
npm audit
```

`verify` 執行嚴格型別檢查、Node.js 回歸測試與正式建置。Node.js 24 直接執行 TypeScript 測試，不需要另一個測試框架或轉譯工具。

Playwright 啟動靜態產物的本機預覽，使用桌面 Chromium 與手機尺寸的 Chromium，驗證小數輸入、失效結果、紀錄上限、重新載入、刪除、清空、舊資料轉移、儲存失敗、HTML 注入防護及鍵盤操作。手機測試是瀏覽器模擬，沒有驗證實體手機或 Safari。

設定環境變數 `BMI_E2E_BASE_URL` 可對部署網址執行同一套測試，不啟動本機伺服器。測試資料只存在隔離的瀏覽器儲存。

## 安全與維護

儲存資料在載入時重新驗證，BMI 分級與顏色從身高、體重重算。顯示紀錄使用 `textContent`，不把儲存內容當 HTML 執行。Cloudflare Pages 透過 `public/_headers` 設定 CSP、禁止嵌入頁面、MIME 類型保護及權限限制；CSP 允許動態顏色使用的 inline style，script 則僅允許本站來源。

移除 Next.js 與 ESLint 工具鏈後，原有的 `braces` 漏洞依賴鏈也一併移除。本次完整 `npm audit` 結果為 0 項漏洞；這是當時的檢查結果，後續更新仍需重跑 audit 與測試。

## 專案結構

```text
index.html          # 首頁、語系、頁面資訊與 favicon
src/main.ts         # 表單、結果、紀錄操作與儲存錯誤處理
src/style.css       # 響應式樣式、字型、反白與捲軸
lib/bmi.ts          # 計算、分級與紀錄驗證
types/bmi.ts        # 結果與歷史紀錄型別
public/favicon.svg  # 網站圖示
public/fonts-OFL.txt # 字型授權
public/img/         # 品牌與操作圖示
public/_headers     # Cloudflare Pages 回應標頭
tests/              # Node.js 回歸測試
e2e/                # Playwright 瀏覽器測試
vite.config.ts      # 保留字型檔案，供 CSP 與快取使用
cloudflare-pages.config.json # Pages 建置設定範本
.github/workflows/ci.yml # 自動驗證
```

## CI 與部署

GitHub Actions 在推送 `main` 或建立 pull request 時執行乾淨安裝、完整依賴 audit、型別檢查、回歸測試、正式建置與瀏覽器測試。CI 使用 Node.js 24 與固定的 npm 版本，Action 固定到 commit。

Cloudflare Pages 從 `main` 自動建置並發布 `dist/`，不需要 Pages Functions 或框架轉接器。[GitHub Pages](https://happyloa.github.io/BMI-Calculator/) 另外透過平台的 Jekyll 工作流程發布文件頁。

Pages 專案的建置設定保存在 `cloudflare-pages.config.json`，由官方 `cf pages edit` API 套用至既有 `bmi-calculator` 專案。Cloudflare 不會自動讀取此 JSON，修改範本後仍需同步帳號中的設定：

| 設定               | 值                                                            |
| ------------------ | ------------------------------------------------------------- |
| 建置命令           | `npm install --global npm@11.19.0 && npm ci && npm run build` |
| 輸出目錄           | `dist`                                                        |
| 根目錄             | repository 根目錄                                             |
| 正式與預覽環境變數 | `SKIP_DEPENDENCY_INSTALL=1`                                   |
| Node.js            | 由 `.nvmrc` 指定 24                                           |

`SKIP_DEPENDENCY_INSTALL` 讓 Pages 略過內建的套件安裝，改由建置命令先安裝指定 npm，再依 lockfile 安裝套件。部署需確認 Cloudflare 建置與發布成功，並驗證正式網址的功能。其他靜態託管平台也可發布 `dist/`。
