"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Revalidate server-rendered shop pages when the user returns to the tab
 * or restores from the browser back-forward cache.
 */
export function FreshDataOnReturn() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let lastRefresh = 0;
    const refresh = () => {
      const now = Date.now();
      // Avoid hammering refresh if multiple events fire together.
      if (now - lastRefresh < 750) return;
      lastRefresh = now;
      router.refresh();
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) refresh();
    };

    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [router, pathname]);

  return null;
}
