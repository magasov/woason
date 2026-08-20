"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./header";
import { CatalogDrawer } from "./catalog-drawer";
import { Footer } from "./footer";
import { Container } from "./container";
import { ChatNotice } from "./chat-notice";
import { NotifyPrompt } from "./notify-prompt";

export function ShopShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const isReels = path.startsWith("/reels");
  const headerRef = useRef<HTMLDivElement>(null);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const toggleCatalog = useCallback(() => setCatalogOpen((v) => !v), []);
  const closeCatalog = useCallback(() => setCatalogOpen(false), []);

  useEffect(() => {
    setCatalogOpen(false);
  }, [path]);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const apply = () => {
      document.documentElement.style.setProperty("--header-h", `${el.offsetHeight}px`);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty("--header-h");
    };
  }, [isReels]);

  return (
    <div className="flex h-full min-h-[100vh] w-full flex-1 flex-col">
      <div ref={headerRef} className={`shrink-0 ${isReels ? "hidden md:block" : ""}`}>
        <Header onToggleCatalog={toggleCatalog} catalogOpen={catalogOpen} />
      </div>
      <main className="flex flex-1 flex-col">
        {isReels ? (
          <div className="flex flex-1 flex-col md:py-8">{children}</div>
        ) : (
          <Container className="flex min-w-0 flex-1 flex-col py-6 md:py-8">
            {children}
          </Container>
        )}
      </main>
      <div className={`mt-auto shrink-0 ${isReels ? "hidden md:block" : ""}`}>
        <Footer />
      </div>
      <CatalogDrawer open={catalogOpen} onClose={closeCatalog} />
      <NotifyPrompt />
      <ChatNotice />
    </div>
  );
}
