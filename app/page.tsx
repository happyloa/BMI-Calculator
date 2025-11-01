// 匯入主要的 BMI 計算元件與頁腳，組成單頁應用的主要內容。
import BMICalculator from "@/components/BMICalculator";
import Footer from "@/components/Footer";

export default function Home() {
  // Next.js 14+ 的 App Router 會將此函式作為 `/` 路徑的 Server Component。
  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-white">
      <BMICalculator />
      <Footer />
    </main>
  );
}
