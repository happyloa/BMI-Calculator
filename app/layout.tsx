import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";

import "./globals.css";

const notoSans = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

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
      <body
        className={`${notoSans.className} min-h-screen bg-white text-base text-[#424242]`}
      >
        {children}
      </body>
    </html>
  );
}
