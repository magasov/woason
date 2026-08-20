import Link from "next/link";
import { Container } from "@/components/container";

export default function NotFound() {
  return (
    <Container className="grid h-full min-h-[100vh] place-items-center py-16 text-center">
      <div>
        <p className="text-5xl font-black text-ink">404</p>
        <p className="mt-2 text-muted">Этой страницы нет в зоне WOAson</p>
        <Link href="/" className="mt-4 inline-block text-ember">
          На главную
        </Link>
      </div>
    </Container>
  );
}
