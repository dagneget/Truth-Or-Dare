"use client";

import { useGameStore } from "@/store/useGameStore";

type TimerRingProps = {
  seconds: number;
  max: number;
};

export function TimerRing({ seconds, max }: TimerRingProps) {
  const pct = max > 0 ? Math.max(0, Math.min(1, seconds / max)) : 0;
  const deg = pct * 360;

  return (
    <div className="timer-ring-animate relative h-24 w-24 sm:h-28 sm:w-28">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(var(--neon-cyan) ${deg}deg, rgba(255,255,255,0.08) 0deg)`,
          mask: "radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 6px + 1px))",
          WebkitMask:
            "radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 6px + 1px))",
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-[var(--neon-cyan)] text-glow-cyan sm:text-3xl">
          {seconds}
        </span>
        <span className="text-[10px] font-bold tracking-widest text-[var(--neon-cyan)]/80">SEC</span>
      </div>
    </div>
  );
}
