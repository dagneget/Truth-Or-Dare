"use client";

import type { ReactNode } from "react";
import { useGameStore } from "@/store/useGameStore";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Brain, Flame, Zap, Star } from "lucide-react";

export function PlayerOrbit({ children }: { children?: ReactNode }) {
  const players = useGameStore((s) => s.players);
  const selectedId = useGameStore((s) => s.selectedPlayerId);
  const phase = useGameStore((s) => s.phase);

  if (!players.length) return null;

  const radius = 42;
  const count = players.length;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[min(420px,95vw)] p-4">
      {/* Premium Neon Board Background */}
      <div className="absolute inset-0 z-0">
        <svg viewBox="0 0 100 100" className="h-full w-full opacity-80">
          {/* Outer Ring */}
          <circle 
            cx="50" cy="50" r="48" 
            fill="none" 
            stroke="url(#neonGradient)" 
            strokeWidth="0.5" 
            className="animate-[pulse_4s_infinite]"
          />
          
          {/* Middle Pattern Ring */}
          <circle 
            cx="50" cy="50" r="38" 
            fill="none" 
            stroke="var(--neon-purple)" 
            strokeWidth="0.2" 
            strokeDasharray="1, 2"
            className="opacity-40"
          />
          
          {/* Inner Compass Star */}
          <g className="opacity-20">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((ang) => (
              <line
                key={ang}
                x1="50" y1="50"
                x2={50 + 35 * Math.cos((ang * Math.PI) / 180)}
                y2={50 + 35 * Math.sin((ang * Math.PI) / 180)}
                stroke="var(--neon-cyan)"
                strokeWidth="0.1"
              />
            ))}
          </g>

          {/* Center Compass Star Decor */}
          <path
            d="M50 20 L53 47 L80 50 L53 53 L50 80 L47 53 L20 50 L47 47 Z"
            fill="none"
            stroke="var(--neon-cyan)"
            strokeWidth="0.5"
            className="opacity-30"
          />

          <defs>
            <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--neon-cyan)" />
              <stop offset="50%" stopColor="var(--neon-purple)" />
              <stop offset="100%" stopColor="var(--neon-pink)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Decorative Icons on the Board */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <Brain className="absolute top-[15%] left-[20%] h-6 w-6 text-[var(--neon-cyan)]" />
        <Flame className="absolute top-[15%] right-[20%] h-6 w-6 text-[var(--neon-pink)]" />
        <Zap className="absolute bottom-[15%] left-[25%] h-6 w-6 text-[var(--neon-purple)]" />
        <Star className="absolute bottom-[15%] right-[25%] h-6 w-6 text-yellow-400" />
      </div>

      {/* Players */}
      {players.map((p, i) => {
        const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);
        
        // Find if this player is the "Bravest Soul" (highest streak)
        const maxStreak = Math.max(...players.map(p => 0), 0); // Placeholder for stats in players
        // Actually, stats are in the store but players array might not have them yet.
        // For now, I'll use a demo logic or wait for store sync.
        
        const isTurn = selectedId === p.id && (phase === "choose" || phase === "revealed" || phase === "voting");
        
        return (
          <div
            key={p.id}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 z-10"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <motion.div
              animate={isTurn ? { scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              className={cn(
                "relative flex h-14 w-14 items-center justify-center rounded-full text-xl transition-all duration-500",
                `bg-gradient-to-br ${p.avatarColor || "from-pink-500 to-purple-600"}`,
                isTurn
                  ? "ring-[4px] ring-white shadow-[0_0_40px_rgba(255,255,255,0.6)]"
                  : "ring-[2px] ring-white/20 shadow-lg shadow-black/50"
              )}
            >
              {/* Neon Ring Overlay */}
              <div className={cn(
                "absolute inset-[-4px] rounded-full border-2 opacity-60",
                isTurn ? "border-white animate-pulse" : "border-white/10"
              )} />
              
              {p.avatarEmoji || p.name.slice(0, 1).toUpperCase()}
            </motion.div>
            
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors duration-300",
              isTurn 
                ? "bg-white text-black shadow-[0_0_15px_white]" 
                : "bg-black/40 text-white/70 backdrop-blur-sm"
            )}>
              {p.name}
            </span>
          </div>
        );
      })}

      {/* Center Bottle Holder */}
      <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
        <div className="absolute inset-0 -z-10 rounded-full bg-[var(--neon-purple)]/10 blur-[60px]" />
        {children}
      </div>
    </div>
  );
}
