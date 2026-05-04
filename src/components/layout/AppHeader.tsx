"use client";

import Link from "next/link";
import { Settings, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/store/useGameStore";

type AppHeaderProps = {
  showBack?: boolean;
  backHref?: string;
  title?: string;
};

export function AppHeader({ showBack, backHref = "/", title = "TRUTH OR DARE" }: AppHeaderProps) {
  const avatarEmoji = useGameStore((s) => s.avatarEmoji);
  const avatarColor = useGameStore((s) => s.avatarColor);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-black/30 px-4 py-3 backdrop-blur-md">
      <div className="flex w-10 justify-start">
        {showBack ? (
          <Link
            href={backHref}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-[var(--neon-pink)] transition hover:glow-border-pink"
            aria-label="Back"
          >
            <ChevronLeft className="h-6 w-6" />
          </Link>
        ) : (
          <Link
            href="/profile"
            className={cn(
              `flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--neon-pink)] shadow-[0_0_14px_rgba(255,65,175,0.45)] bg-gradient-to-br ${avatarColor}`
            )}
            aria-label="Profile"
          >
            <span className="text-lg">{avatarEmoji}</span>
          </Link>
        )}
      </div>
      <h1
        className={cn(
          "font-[family-name:var(--font-space-grotesk)] text-center text-sm font-bold tracking-widest text-[var(--neon-pink-bright)] sm:text-base",
          "text-glow-pink"
        )}
      >
        {title}
      </h1>
      <div className="flex w-10 justify-end">
        <Link
          href="/settings"
          className="text-[var(--neon-pink)] transition hover:drop-shadow-[0_0_8px_rgba(255,65,175,0.8)]"
          aria-label="Settings"
        >
          <Settings className="h-6 w-6" strokeWidth={1.75} />
        </Link>
      </div>
    </header>
  );
}
