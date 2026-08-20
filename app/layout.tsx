import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "WOAson — всё в одной зоне",
  description:
    "ВОАЗОН: своя зона покупок. Новые товары и б/у объявления, Шортс, бесплатная регистрация продавцов, СДЭК и Почта России.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${manrope.variable} h-full min-h-[100vh] antialiased`}>
      <body className="flex h-full min-h-[100vh] flex-col font-sans">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
