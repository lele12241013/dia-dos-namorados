"use client";

import { useEffect } from "react";

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Disable browser's automatic scroll restoration to allow manual control
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  return <>{children}</>;
}
