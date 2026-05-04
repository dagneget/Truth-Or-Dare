"use client";

import { useEffect, useState, useRef } from "react";
import { Send } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import { sendMessage, subscribeChat } from "@/lib/supabase/rooms";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { ChatMessage } from "@/types/game";

export default function ChatPage() {
  const setChatUnread = useGameStore((s) => s.setChatUnread);
  const roomCode = useGameStore((s) => s.roomCode);
  const selfId = useGameStore((s) => s.selfId);
  const displayName = useGameStore((s) => s.displayName);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChatUnread(false);
  }, [setChatUnread]);

  useEffect(() => {
    if (!roomCode || !isSupabaseConfigured) return;

    const unsub = subscribeChat(roomCode, (msgs) => {
      // Firebase returns desc by createdAt, we want to show it in order
      setMessages([...msgs].reverse());
    });

    return () => unsub();
  }, [roomCode]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!inputText.trim() || !roomCode || !isSupabaseConfigured) return;

    const text = inputText.trim();
    setInputText("");

    try {
      await sendMessage(roomCode, selfId, displayName, text);
    } catch (e) {
      console.error("Failed to send message", e);
    }
  }

  return (
    <div className="flex h-[calc(100dvh-180px)] flex-col pb-4 pt-4">
      <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-white">
        Party Chat
      </h2>
      
      {!isSupabaseConfigured && (
        <p className="mt-2 text-xs text-amber-300/80">
          Firebase not configured. Chat is in preview mode.
        </p>
      )}

      <div className="mt-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="flex flex-col gap-4">
          {messages.length === 0 ? (
            <p className="py-8 text-center text-xs text-[var(--muted)]">No messages yet. Say hi! 👋</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.uid === selfId ? "items-end" : "items-start"}`}
              >
                <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  {msg.name}
                </span>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.uid === selfId
                      ? "bg-gradient-to-br from-[var(--neon-pink)] to-[var(--neon-purple)] text-white shadow-[0_0_12px_rgba(255,65,175,0.2)]"
                      : "glass-panel text-white/90"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void handleSend()}
          placeholder="Send a message..."
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[var(--neon-pink)]/50 focus:bg-white/10"
        />
        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={!inputText.trim()}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--neon-pink)] text-white shadow-[0_0_12px_rgba(255,65,175,0.4)] transition hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

