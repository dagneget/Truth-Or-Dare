"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, MessageSquare } from "lucide-react";
import { sendMessage, subscribeChat } from "@/lib/supabase/rooms";
import type { ChatMessage } from "@/types/game";
import { useGameStore } from "@/store/useGameStore";

export function GameChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const roomCode = useGameStore((s) => s.roomCode);
  const selfId = useGameStore((s) => s.selfId);
  const players = useGameStore((s) => s.players);
  const chatUnread = useGameStore((s) => s.chatUnread);
  const setChatUnread = useGameStore((s) => s.setChatUnread);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const me = players.find((p) => p.id === selfId);

  useEffect(() => {
    if (!roomCode) return;
    const unsub = subscribeChat(roomCode, (msgs) => {
      // Sort ascending for the feed
      setMessages([...msgs].reverse());
      if (!isOpen && msgs.length > 0) {
        setChatUnread(true);
      }
    });
    return () => unsub();
  }, [roomCode, isOpen, setChatUnread]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || !roomCode || !me) return;
    
    const msg = text.trim();
    setText("");
    await sendMessage(roomCode, selfId, me.name, msg);
  };

  return (
    <>
      {/* Floating Chat Toggle */}
      <button
        onClick={() => {
          setIsOpen(true);
          setChatUnread(false);
        }}
        className="fixed bottom-24 left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--neon-purple)]/20 text-[var(--neon-purple)] shadow-[0_0_15px_rgba(194,101,255,0.3)] backdrop-blur-md transition-transform hover:scale-110 active:scale-95"
      >
        <MessageSquare className="h-6 w-6" />
        {chatUnread && (
          <div className="absolute -right-1 -top-1 h-4 w-4 animate-bounce rounded-full bg-[var(--neon-pink)] shadow-[0_0_8px_var(--neon-pink)]" />
        )}
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-[110] flex w-full max-w-xs flex-col border-r border-white/10 bg-[#0a0a0a]/95 backdrop-blur-2xl shadow-[10px_0_40px_rgba(0,0,0,0.5)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 p-4">
              <h3 className="font-[family-name:var(--font-space-grotesk)] text-sm font-bold uppercase tracking-widest text-[var(--neon-purple)]">
                Party Chat
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-[var(--muted)] hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
            >
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center opacity-30">
                  <MessageSquare className="h-12 w-12 mb-2" />
                  <p className="text-xs">No messages yet.<br/>Break the ice!</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.uid === selfId;
                  const player = players.find(p => p.id === m.uid);
                  return (
                    <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <span className="mb-1 text-[10px] font-medium text-[var(--muted)]">
                        {m.name}
                      </span>
                      <div 
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                          isMe 
                            ? "bg-[var(--neon-purple)]/20 text-white border border-[var(--neon-purple)]/30" 
                            : "bg-white/5 text-white/90 border border-white/10"
                        }`}
                        style={{
                          borderColor: !isMe && player ? player.avatarColor : undefined,
                        }}
                      >
                        {m.text}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="border-t border-white/5 p-4 bg-black/40">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 pr-12 text-sm text-white focus:border-[var(--neon-purple)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--neon-purple)]/50"
                />
                <button
                  type="submit"
                  className="absolute right-2 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--neon-purple)] text-white shadow-[0_0_10px_rgba(194,101,255,0.4)] transition-transform hover:scale-105 active:scale-95"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
