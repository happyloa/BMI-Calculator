import BMICalculator from "@/components/BMICalculator";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-white">
      <BMICalculator />
      <Footer />
    </main>
  );
}
