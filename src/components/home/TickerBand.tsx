"use client";

const TICKER_ITEMS = [
  "Özel Yazılım",
  "Web Geliştirme",
  "Dijital Ürünler",
  "Otomasyon",
  "Google Ads",
  "Meta Ads",
  "SaaS",
  "Büyüme Altyapısı",
];

export function TickerBand() {
  return (
    <div className="relative py-4 md:py-5 bg-[#343131] overflow-hidden">
      <div className="absolute inset-0 flex whitespace-nowrap animate-marquee">
        {[...Array(2)].map((_, j) => (
          <div key={j} className="flex items-center gap-16 px-8 shrink-0">
            {TICKER_ITEMS.map((item, i) => (
              <span
                key={`${j}-${i}`}
                className="text-lg md:text-xl font-black tracking-tight text-white/90"
              >
                {item}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
