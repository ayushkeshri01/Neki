"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * NavigationRefresher ensures that when a user navigates back or forward
 * using the browser's history buttons, the page content is refreshed
 * to avoid displaying stale data from the router cache.
 */
export function NavigationRefresher() {
  const router = useRouter();

  useEffect(() => {
    const handlePopState = () => {
      // Small delay to ensure Next.js has finished its internal route change
      setTimeout(() => {
        router.refresh();
      }, 10);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router]);

  return null;
}
