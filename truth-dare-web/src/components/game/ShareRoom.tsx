"use client";

import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { X, Share2, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function ShareRoom({ roomCode, isOpen, onClose }: { roomCode: string; isOpen: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const shareUrl = `${baseUrl}/room?join=${roomCode}`;

  const handleCopy = () => {
    void navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-sm overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0e0e0e] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
          >
            <button
              onClick={onClose}
              className="absolute right-6 top-6 rounded-full bg-white/5 p-2 text-white/50 hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--neon-cyan)]/10 text-[var(--neon-cyan)] shadow-[0_0_20px_rgba(0,251,251,0.2)]">
                <Share2 className="h-8 w-8" />
              </div>
              
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-black uppercase tracking-widest text-white">
                Invite Squad
              </h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Scan to join the party instantly
              </p>

              <div className="group relative mt-8 rounded-3xl border-4 border-white/5 bg-white p-4 shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-transform hover:scale-105">
                <QRCodeSVG 
                  value={shareUrl} 
                  size={200}
                  level="H"
                  includeMargin={false}
                  imageSettings={{
                    src: "/favicon.ico",
                    x: undefined,
                    y: undefined,
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-white/0 opacity-0 transition-opacity group-hover:bg-white/10 group-hover:opacity-100" />
              </div>

              <div className="mt-8 flex w-full flex-col gap-3">
                <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 border border-white/5">
                  <span className="font-mono text-xs text-white/60 overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">
                    {shareUrl}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="ml-2 rounded-lg bg-[var(--neon-cyan)]/20 p-2 text-[var(--neon-cyan)] transition hover:bg-[var(--neon-cyan)] hover:text-black"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                  Room Code: <span className="text-[var(--neon-cyan)]">{roomCode}</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
