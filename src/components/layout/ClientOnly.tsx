"use client";

import { useEffect, useState, ReactNode } from "react";

export function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-dvh flex items-center justify-center opacity-0" aria-hidden="true" />;
  }

  return <>{children}</>;
}
