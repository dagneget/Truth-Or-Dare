"use client";

import { ShoppingBag } from "lucide-react";

export default function StorePage() {
  return (
    <div className="flex flex-col items-center pb-8 pt-12 text-center">
      <ShoppingBag className="h-16 w-16 text-[var(--muted)]" strokeWidth={1.25} />
      <h2 className="mt-6 font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-white">
        Store
      </h2>
      <p className="mt-3 max-w-xs text-sm text-[var(--muted)]">
        Premium packs and themes will land here. For now, add your own prompts under{" "}
        <span className="text-[var(--neon-cyan)]">My custom prompts</span>.
      </p>
    </div>
  );
}
