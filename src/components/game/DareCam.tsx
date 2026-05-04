"use client";

import { X, Maximize2, Minimize2 } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface DareCamProps {
  roomCode: string;
  onClose: () => void;
  isStreaming: boolean;
  playerName: string;
}

export function DareCam({ roomCode, onClose, isStreaming, playerName }: DareCamProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  
  // Clean room code for Jitsi
  const jitsiRoomName = `truth-dare-v1-${roomCode.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
  
  // Configuration for a clean, minimalist UI
  const url = `https://meet.jit.si/${jitsiRoomName}#config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.disableDeepLinking=true&interfaceConfig.TOOLBAR_BUTTONS=["microphone","camera"]`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className={`fixed z-[100] overflow-hidden rounded-3xl border-2 border-[var(--neon-pink)]/50 bg-black shadow-[0_0_50px_rgba(255,65,175,0.4)] transition-all duration-300 ${
        isMaximized 
          ? "inset-4 md:inset-10" 
          : "bottom-24 right-4 h-64 w-48 md:h-80 md:w-60"
      }`}
    >
      {/* Header */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent p-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-red-500 shadow-[0_0_8px_red]" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-white">
            {isStreaming ? "LIVE DARE" : `${playerName}'s Stream`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="rounded-full bg-white/10 p-1.5 text-white/70 hover:bg-white/20"
          >
            {isMaximized ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </button>
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 p-1.5 text-white/70 hover:bg-white/20"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Jitsi Iframe */}
      <iframe
        src={url}
        allow="camera; microphone; display-capture; autoplay; clipboard-write"
        className="h-full w-full border-none"
        title="Dare Cam"
      />
      
      {!isMaximized && (
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
      )}
    </motion.div>
  );
}
