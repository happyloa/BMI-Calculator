// 使用 Next.js Metadata API 來設定文件標題與描述。
import type { Metadata } from "next";
// 全域樣式需在 RootLayout 中載入，確保 Tailwind 與自訂 CSS 正常生效。
import "./globals.css";

export const metadata: Metadata = {
  title: "BMI 計算器",
  description: "使用最新 Next.js 與 Tailwind CSS 打造的 BMI 計算器",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // RootLayout 會包裹所有頁面，並設定全域語系、字體與背景樣式。
  return (
    <html lang="zh-Hant">
      <body className="min-h-screen bg-white font-sans text-base text-[#424242]">
        {children}
      </body>
    </html>
  );
}
