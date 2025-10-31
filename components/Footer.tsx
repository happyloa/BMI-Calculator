export default function Footer() {
  return (
    <footer className="flex w-full items-center justify-center bg-[#FFD366] px-6 py-6">
      <div className="flex items-center gap-4">
        <div
          className="h-12 w-12 bg-contain bg-no-repeat lg:h-[55px] lg:w-[55px]"
          style={{
            backgroundImage: "url('/img/BMICLogo.png')",
            filter: "drop-shadow(36px 0 0 #424242)",
          }}
          aria-hidden="true"
        />
        <p className="text-base text-[#424242] lg:text-lg">by 謝宗佑</p>
      </div>
    </footer>
  );
}
