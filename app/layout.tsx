import type { Metadata } from "next";
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
  return (
    <html lang="zh-Hant">
      <body className="min-h-screen bg-white font-sans text-base text-[#424242]">
        {children}
      </body>
    </html>
  );
}
