"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Flame, PlusCircle, LogIn, HelpCircle, ArrowRight } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";

export default function PartyLandingPage() {
  const roomCode = useGameStore((s) => s.roomCode);

  return (
    <div className="flex flex-col items-center pb-8 pt-6">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-8 flex h-28 w-28 items-center justify-center rounded-full border border-[var(--neon-pink)]/30 bg-[var(--surface-high)] shadow-[0_0_32px_rgba(255,65,175,0.2)]"
      >
        <Flame className="h-14 w-14 text-[var(--neon-pink)] drop-shadow-[0_0_12px_#ff41af]" />
      </motion.div>
      <h2 className="font-[family-name:var(--font-space-grotesk)] text-center text-3xl font-bold tracking-tight text-white text-glow-pink sm:text-4xl">
        ARE YOU READY?
      </h2>
      <p className="mt-3 max-w-xs text-center text-sm leading-relaxed text-[var(--muted)]">
        The ultimate party game. No holding back. No secrets.
      </p>

      <div className="mt-10 flex w-full max-w-sm flex-col gap-4">
        {roomCode ? (
          <Link
            href="/lobby"
            className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] py-4 font-[family-name:var(--font-space-grotesk)] text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_24px_rgba(0,251,251,0.35)] transition hover:brightness-110"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <ArrowRight className="h-5 w-5" />
            </span>
            Continue Party
          </Link>
        ) : (
          <>
            <Link
              href="/room"
              className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#ff40a0] to-[#b040ff] py-4 font-[family-name:var(--font-space-grotesk)] text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_24px_rgba(255,64,160,0.45)] transition hover:brightness-110"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <PlusCircle className="h-5 w-5" />
              </span>
              Create Room
            </Link>
            <Link
              href="/room?mode=join"
              className="glass-panel glow-border-cyan flex items-center justify-center gap-3 rounded-2xl py-4 font-[family-name:var(--font-space-grotesk)] text-sm font-bold uppercase tracking-wider text-[var(--neon-cyan)] transition hover:bg-[var(--neon-cyan)]/10"
            >
              <LogIn className="h-5 w-5" />
              Join Room
            </Link>
          </>
        )}
      </div>

      <button
        type="button"
        className="mt-8 flex items-center gap-2 text-xs text-[var(--muted)] underline decoration-[var(--muted)]/50 underline-offset-4"
      >
        <HelpCircle className="h-4 w-4" />
        How to play
      </button>
    </div>
  );
}
