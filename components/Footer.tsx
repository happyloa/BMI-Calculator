// 頁面底部的簡易資訊列，展示作者資訊與品牌圖示。
export default function Footer() {
  return (
    <footer className="flex h-[90px] w-full items-center justify-center bg-[#FFD366]">
      <div className="flex items-center justify-center">
        <div
          className="relative left-[-55px] h-[55px] w-[55px] bg-contain bg-no-repeat"
          style={{
            backgroundImage: "url('/img/BMICLogo.png')",
            filter: "drop-shadow(55px 0 0 #424242)",
          }}
          aria-hidden="true"
        />
        <p className="text-lg text-[#424242]">by 謝宗佑</p>
      </div>
    </footer>
  );
}
