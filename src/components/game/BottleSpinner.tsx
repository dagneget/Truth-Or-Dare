"use client";

import { motion, useMotionValue, animate } from "framer-motion";
import { useEffect } from "react";
import { useGameStore } from "@/store/useGameStore";

export function BottleSpinner() {
  const bottleRotation = useGameStore((s) => s.bottleRotation);
  const phase = useGameStore((s) => s.phase);
  const rotation = useMotionValue(0);

  useEffect(() => {
    const controls = animate(rotation, bottleRotation, {
      duration: 3,
      ease: [0.12, 0.8, 0.15, 1],
    });
    return () => controls.stop();
  }, [bottleRotation, rotation]);

  const spinning = phase === "spinning";

  return (
    <div className="relative flex aspect-square w-[min(280px,60vw)] items-center justify-center">
      <motion.div
        className="relative z-10 flex items-center justify-center"
        style={{ rotate: rotation }}
      >
        {/* The Bottle Image with Background Removal - Square container for perfect rotation sync */}
        <div className="relative h-96 w-96 flex items-center justify-center transition-transform hover:scale-105">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/bottle.png"
            alt="Galaxy Bottle"
            className="h-full w-full object-contain rotate-[110deg] mix-blend-multiply brightness-125 contrast-110"
          />
          
          {/* Glow effect centered on the bottle */}
          <div className="absolute inset-0 -z-10 rounded-full bg-purple-500/10 blur-3xl" />
        </div>
      </motion.div>
      
      {/* Pulse effect during spinning */}
      {spinning && (
        <motion.div
          animate={{ 
            scale: [1, 1.15, 1], 
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute h-[110%] w-[110%] rounded-full border border-[var(--neon-purple)]/20 shadow-[inset_0_0_40px_rgba(194,101,255,0.1)]"
        />
      )}
    </div>
  );
}
