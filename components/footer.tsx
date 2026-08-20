import Link from "next/link";
import { Container } from "./container";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-auto w-full shrink-0 border-t border-stone-200 bg-paper">
      <Container className="grid gap-8 py-10 md:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted">
            ВОАЗОН — всё в одной зоне. Новые товары и б/у объявления, доставка по России.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Покупателям</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link href="/messages">Сообщения</Link></li>
            <li><Link href="/cart">Корзина</Link></li>
            <li><Link href="/favorites">Избранное</Link></li>
            <li><Link href="/reels">Шортс</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Продавцам</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link href="/register">Бесплатная регистрация</Link></li>
            <li><Link href="/seller">Кабинет продавца</Link></li>
            <li><Link href="/seller/settings">Настройки витрины</Link></li>
            <li>СДЭК и Почта России</li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">В зоне</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>Новые товары от магазинов</li>
            <li>Б/у и объявления от частных лиц</li>
            <li>Самовывоз, СДЭК, Почта</li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-stone-200 py-4 text-center text-xs text-stone-400">
        WOAson · своя зона покупок
      </div>
    </footer>
  );
}
