import Link from "next/link";

const banners = [
  {
    href: "/register",
    title: "Продавцам — бесплатно",
    text: "Магазин за 5 минут. СДЭК и Почта России уже внутри.",
    className: "from-ink to-stone-700",
  },
  {
    href: "/?condition=new",
    title: "Хорошая цена",
    text: "Подборка скидок от 30% — без шума и чужих витрин.",
    className: "from-ember to-ember-dark",
  },
  {
    href: "/reels",
    title: "Шортс недели",
    text: "Короткие обзоры 4:3. Листай — и сразу в корзину.",
    className: "from-stone-900 to-stone-600",
  },
];

export function PromoBanners() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {banners.map((b) => (
        <Link
          key={b.title}
          href={b.href}
          className={`rounded-2xl bg-gradient-to-br p-5 text-white shadow-sm ${b.className}`}
        >
          <p className="text-lg font-bold">{b.title}</p>
          <p className="mt-1 text-sm text-white/85">{b.text}</p>
        </Link>
      ))}
    </div>
  );
}
