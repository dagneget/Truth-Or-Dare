"use client";

import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { useGameStore } from "@/store/useGameStore";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";

const DURATIONS = [15, 30, 60, 90];

export default function SettingsPage() {
  const timerEnabled = useGameStore((s) => s.timerEnabled);
  const setTimerEnabled = useGameStore((s) => s.setTimerEnabled);
  const dareTimeLimit = useGameStore((s) => s.dareTimeLimit);
  const setDareTimeLimit = useGameStore((s) => s.setDareTimeLimit);
  const leaveRoom = useGameStore((s) => s.leaveRoom);
  
  const { requestPermission, subscribeToPush, checkSubscription, isSupported } = usePushNotifications();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [loadingPush, setLoadingPush] = useState(false);

  useEffect(() => {
    if (isSupported && checkSubscription) {
      checkSubscription().then(sub => setPushEnabled(!!sub)).catch(() => {});
    }
  }, [isSupported]);

  const handlePushToggle = async () => {
    if (!isSupported) {
      alert("Push notifications are not supported in your browser");
      return;
    }
    
    setLoadingPush(true);
    try {
      if (pushEnabled) {
        setPushEnabled(false);
      } else {
        const sub = await subscribeToPush();
        setPushEnabled(!!sub);
      }
    } catch (err) {
      console.error("Push toggle error:", err);
    } finally {
      setLoadingPush(false);
    }
  };

  return (
    <div className="pb-8 pt-4">
      <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-white">
        Game Settings
      </h2>

      <div className="mt-8 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
        <div>
          <p className="font-semibold text-white">Dare timer</p>
          <p className="text-xs text-[var(--muted)]">Countdown during dares</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={timerEnabled}
          onClick={() => setTimerEnabled(!timerEnabled)}
          className={`relative h-8 w-14 rounded-full transition ${timerEnabled ? "bg-[var(--neon-cyan)]" : "bg-white/20"}`}
        >
          <span
            className={`absolute top-1 h-6 w-6 rounded-full bg-black transition ${timerEnabled ? "left-7" : "left-1"}`}
          />
        </button>
      </div>

      <label className="mt-6 block">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--neon-cyan)]">
          Dare time limit (seconds)
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          {DURATIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setDareTimeLimit(s)}
              className={`rounded-xl px-4 py-2 text-sm font-bold ${
                dareTimeLimit === s
                  ? "bg-[var(--neon-cyan)] text-black"
                  : "border border-white/15 text-[var(--muted)]"
              }`}
            >
              {s}s
            </button>
          ))}
        </div>
      </label>

      <div className="glass-panel mt-8 rounded-2xl p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Sync status</p>
        <p className="mt-2 text-sm text-white/85">
          {isSupabaseConfigured
            ? "Supabase is configured. Live multiplayer rooms, real-time game sync, and shared custom prompts are active."
            : "Add NEXT_PUBLIC_SUPABASE_* keys in `.env.local` to enable sign-in and live multiplayer rooms. Local play works without them."}
        </p>
      </div>

      {isSupported && (
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
          <div className="flex items-center gap-3">
            {pushEnabled ? (
              <Bell className="h-5 w-5 text-[var(--neon-cyan)]" />
            ) : (
              <BellOff className="h-5 w-5 text-[var(--muted)]" />
            )}
            <div>
              <p className="font-semibold text-white">Push Notifications</p>
              <p className="text-xs text-[var(--muted)]">
                {pushEnabled ? "You're all set!" : "Get notified when it's your turn"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handlePushToggle}
            disabled={loadingPush || !isSupported}
            className={`relative h-8 w-14 rounded-full transition ${pushEnabled ? "bg-[var(--neon-cyan)]" : "bg-white/20"} ${loadingPush ? "opacity-50" : ""}`}
          >
            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-black transition ${pushEnabled ? "left-7" : "left-1"}`}
            />
          </button>
        </div>
      )}

      <Link
        href="/custom"
        className="mt-6 block w-full rounded-2xl border border-[var(--neon-purple)]/40 py-4 text-center text-sm font-bold uppercase tracking-wider text-[var(--neon-purple)]"
      >
        Custom truths &amp; dares
      </Link>

      <button
        type="button"
        onClick={() => leaveRoom()}
        className="mt-4 w-full rounded-2xl border border-red-500/40 py-3 text-sm font-semibold text-red-300"
      >
        Leave current room
      </button>
    </div>
  );
}
