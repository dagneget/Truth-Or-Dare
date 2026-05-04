"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Award, Medal, X } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import { cn } from "@/lib/utils";

export function Leaderboard({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const players = useGameStore((s) => s.players);
  const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-[#0e0e0e] shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
          >
            {/* Header */}
            <div className="relative border-b border-white/5 bg-gradient-to-r from-[var(--neon-purple)]/20 to-[var(--neon-pink)]/20 px-6 py-6 text-center">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full bg-white/5 p-2 text-white/50 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
              
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-[var(--neon-pink-bright)] shadow-[0_0_20px_rgba(255,65,175,0.3)]">
                <Trophy className="h-6 w-6" />
              </div>
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-black uppercase tracking-widest text-white text-glow-pink">
                Hall of Fame
              </h2>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                Current Rankings
              </p>
            </div>

            {/* List */}
            <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
              <div className="space-y-2">
                {sortedPlayers.map((p, index) => {
                  const isTop3 = index < 3;
                  const Icon = index === 0 ? Award : index === 1 ? Medal : index === 2 ? Medal : null;
                  
                  return (
                    <motion.div
                      layout
                      key={p.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "flex items-center justify-between rounded-2xl border px-4 py-3 transition-all",
                        index === 0 
                          ? "border-[var(--neon-pink)]/40 bg-[var(--neon-pink)]/10 shadow-[0_0_15px_rgba(255,65,175,0.1)]" 
                          : "border-white/5 bg-white/[0.03]"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                          <span className={cn(
                            "absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black",
                            index === 0 ? "bg-yellow-400 text-black" : 
                            index === 1 ? "bg-gray-300 text-black" :
                            index === 2 ? "bg-amber-600 text-white" : "bg-white/10 text-white/60"
                          )}>
                            {index + 1}
                          </span>
                          <div className={cn(
                            "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br text-lg",
                            p.avatarColor || "from-pink-500 to-purple-600"
                          )}>
                            {p.avatarEmoji}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-bold text-white">{p.name}</p>
                          {index === 0 && (
                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--neon-pink-bright)]">
                              Current Legend
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {Icon && (
                          <Icon className={cn(
                            "h-5 w-5",
                            index === 0 ? "text-yellow-400" : index === 1 ? "text-gray-300" : "text-amber-600"
                          )} />
                        )}
                        <div className="text-right">
                          <p className="font-[family-name:var(--font-space-grotesk)] text-lg font-black text-white">
                            {p.score || 0}
                          </p>
                          <p className="text-[8px] font-bold uppercase tracking-widest text-white/30">Points</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white/[0.02] p-6 text-center">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20">
                Complete Dares for 20pts • Truths for 10pts
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
