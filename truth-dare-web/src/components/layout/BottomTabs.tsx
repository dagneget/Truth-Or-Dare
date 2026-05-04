"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, MessageCircle, UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/store/useGameStore";

const tabs = [
  { href: "/", label: "PARTY", icon: Home },
  { href: "/players", label: "PLAYERS", icon: Users },
  { href: "/chat", label: "CHAT", icon: MessageCircle },
  { href: "/profile", label: "PROFILE", icon: UserCircle2 },
] as const;

export function BottomTabs() {
  const pathname = usePathname();
  const chatUnread = useGameStore((s) => s.chatUnread);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0e0e0e]/95 px-2 pb-safe pt-2 backdrop-blur-lg">
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/" || pathname === "/room" || pathname === "/lobby" || pathname === "/play"
              : pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex min-w-[4.5rem] flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-bold tracking-wide transition",
                active
                  ? "text-[var(--neon-cyan)] shadow-[0_0_16px_rgba(0,251,251,0.25)]"
                  : "text-[var(--muted)] hover:text-white/80"
              )}
            >
              {active && (
                <span className="absolute inset-x-2 -top-px h-8 rounded-lg border border-[var(--neon-cyan)]/40 bg-[var(--neon-cyan)]/5" />
              )}
              <span className="relative">
                <Icon className="mx-auto h-5 w-5" strokeWidth={active ? 2.25 : 1.75} />
                {href === "/chat" && chatUnread && (
                  <span className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full bg-[var(--neon-pink)] shadow-[0_0_8px_#ff41af]" />
                )}
              </span>
              <span className="relative font-[family-name:var(--font-space-grotesk)]">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
