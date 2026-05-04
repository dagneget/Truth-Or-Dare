"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { useEffect, useState } from "react";

const EMOJIS = ["🔥", "😂", "😱", "👏", "😈", "❤️", "💯", "💀"];

export function ReactionPicker() {
  const sendReaction = useGameStore((s) => s.sendReaction);

  return (
    <div className="flex flex-wrap justify-center gap-2 rounded-2xl border border-white/5 bg-black/40 p-3 backdrop-blur-xl">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => sendReaction(emoji)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-xl transition-all hover:scale-125 hover:bg-white/10 active:scale-90"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

export function FloatingReactions() {
  const reactions = useGameStore((s) => s.reactions);
  const players = useGameStore((s) => s.players);

  return (
    <div className="pointer-events-none fixed inset-0 z-[80] overflow-hidden">
      <AnimatePresence>
        {reactions.map((r) => {
          const sender = players.find(p => p.id === r.senderId);
          // Random horizontal start position and rotation
          const startX = 20 + Math.random() * 60; // 20% to 80% width
          const rotation = -20 + Math.random() * 40;
          
          return (
            <motion.div
              key={r.id}
              initial={{ 
                y: "110vh", 
                x: `${r.x ?? 50}vw`, 
                scale: 0.5, 
                opacity: 0,
                rotate: rotation
              }}
              animate={{ 
                y: "-10vh", 
                x: `${(r.x ?? 50) + (Math.random() * 20 - 10)}vw`,
                scale: [0.5, 1.5, 1], 
                opacity: [0, 1, 1, 0],
                rotate: rotation + (Math.random() * 60 - 30)
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 3 + Math.random() * 2, 
                ease: "easeOut" 
              }}
              className="absolute text-4xl sm:text-6xl"
              style={{ textShadow: "0 0 20px rgba(255,255,255,0.4)" }}
            >
              <div className="flex flex-col items-center">
                <span>{r.emoji}</span>
                {sender && (
                  <span className="mt-1 rounded-full bg-black/40 px-2 py-0.5 text-[8px] font-bold text-white/60 backdrop-blur-sm">
                    {sender.name}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
