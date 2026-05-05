"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Check, Trophy, Brain, Flame, Shield, Skull, Zap, TrendingUp } from "lucide-react";
import { useGameStore, AVATAR_EMOJIS, AVATAR_COLORS } from "@/store/useGameStore";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { signInAsGuest, signInWithGoogle, signOut } from "@/lib/supabase/auth";
import { useAuthStore } from "@/store/useAuthStore";
import { LogIn, LogOut, Sparkles, UserCircle2 } from "lucide-react";

export default function ProfilePage() {
  const displayName = useGameStore((s) => s.displayName);
  const setDisplayName = useGameStore((s) => s.setDisplayName);
  const avatarEmoji = useGameStore((s) => s.avatarEmoji);
  const avatarColor = useGameStore((s) => s.avatarColor);
  const setAvatarEmoji = useGameStore((s) => s.setAvatarEmoji);
  const setAvatarColor = useGameStore((s) => s.setAvatarColor);
  const stats = useGameStore((s) => s.stats);

  const authReady = useAuthStore((s) => s.ready);
  const user = useAuthStore((s) => s.user);

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(displayName);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const totalChallenges = stats.truthsAnswered + stats.daresCompleted;
  const completionRate = totalChallenges + stats.daresRefused > 0
    ? Math.round((totalChallenges / (totalChallenges + stats.daresRefused)) * 100)
    : 0;

  // Rank based on total challenges completed
  function getRank() {
    if (totalChallenges >= 100) return { title: "Legend", icon: "👑", color: "text-yellow-400" };
    if (totalChallenges >= 50) return { title: "Veteran", icon: "⚔️", color: "text-purple-400" };
    if (totalChallenges >= 25) return { title: "Warrior", icon: "🛡️", color: "text-blue-400" };
    if (totalChallenges >= 10) return { title: "Adventurer", icon: "🗺️", color: "text-green-400" };
    if (totalChallenges >= 5) return { title: "Rookie", icon: "🌱", color: "text-emerald-400" };
    return { title: "Newbie", icon: "🐣", color: "text-gray-400" };
  }

  const rank = getRank();

  async function onGoogle() {
    setAuthError(null);
    setAuthBusy(true);
    try { await signInWithGoogle(); } catch (e) { setAuthError(e instanceof Error ? e.message : "Sign-in failed"); } finally { setAuthBusy(false); }
  }

  async function onGuest() {
    setAuthError(null);
    setAuthBusy(true);
    try { await signInAsGuest(); } catch (e) { setAuthError(e instanceof Error ? e.message : "Guest sign-in failed"); } finally { setAuthBusy(false); }
  }

  async function onSignOut() {
    setAuthError(null);
    setAuthBusy(true);
    try { await signOut(); } catch (e) { setAuthError(e instanceof Error ? e.message : "Sign out failed"); } finally { setAuthBusy(false); }
  }

  return (
    <div className="pb-8 pt-4">
      {/* Avatar + Name Hero */}
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${avatarColor} shadow-[0_0_32px_rgba(255,65,175,0.3)] ring-2 ring-white/20`}
        >
          <span className="text-5xl">{avatarEmoji}</span>
        </motion.div>

        {/* Rank badge */}
        <div className="mt-3 flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1">
          <span className="text-sm">{rank.icon}</span>
          <span className={`text-xs font-bold uppercase tracking-wider ${rank.color}`}>{rank.title}</span>
        </div>

        {/* Display name */}
        {editingName ? (
          <div className="mt-3 flex items-center gap-2">
            <input
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setDisplayName(nameInput);
                  setEditingName(false);
                }
              }}
              className="w-40 rounded-xl border border-[var(--neon-cyan)]/50 bg-black/50 px-3 py-2 text-center text-sm font-bold text-white outline-none"
            />
            <button
              type="button"
              onClick={() => { setDisplayName(nameInput); setEditingName(false); }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--neon-cyan)] text-black"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => { setNameInput(displayName); setEditingName(true); }}
            className="mt-3 flex items-center gap-2 text-lg font-bold text-white"
          >
            {displayName}
            <Pencil className="h-3.5 w-3.5 text-[var(--muted)]" />
          </button>
        )}
      </div>

      {/* Avatar Emoji Picker */}
      <div className="glass-panel mt-8 rounded-2xl p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--neon-cyan)]">
          Choose Your Avatar
        </p>
        <div className="mt-3 grid grid-cols-8 gap-2">
          {AVATAR_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setAvatarEmoji(emoji)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition ${
                avatarEmoji === emoji
                  ? "bg-white/20 ring-2 ring-[var(--neon-cyan)] shadow-[0_0_12px_rgba(0,251,251,0.3)]"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Avatar Color Picker */}
      <div className="glass-panel mt-4 rounded-2xl p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--neon-pink)]">
          Choose Your Color
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          {AVATAR_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setAvatarColor(color)}
              className={`h-10 w-10 rounded-full bg-gradient-to-br ${color} transition ${
                avatarColor === color
                  ? "ring-2 ring-white shadow-[0_0_16px_rgba(255,255,255,0.3)] scale-110"
                  : "ring-1 ring-white/20 hover:scale-105"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="mt-8">
        <h3 className="flex items-center gap-2 font-[family-name:var(--font-space-grotesk)] text-sm font-bold uppercase tracking-wider text-[var(--neon-purple)]">
          <Trophy className="h-4 w-4" />
          Your Stats
        </h3>

        {/* Streak & Rate Cards */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-panel flex flex-col items-center rounded-2xl p-4"
          >
            <Zap className="h-6 w-6 text-yellow-400" />
            <span className="mt-2 font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-white">
              {stats.currentStreak}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
              Current Streak
            </span>
          </motion.div>
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="glass-panel flex flex-col items-center rounded-2xl p-4"
          >
            <TrendingUp className="h-6 w-6 text-[var(--neon-cyan)]" />
            <span className="mt-2 font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-white">
              {completionRate}%
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
              Completion Rate
            </span>
          </motion.div>
        </div>

        {/* Detailed Stats */}
        <div className="mt-3 space-y-2">
          {[
            { label: "Games Played", value: stats.gamesPlayed, icon: <Trophy className="h-4 w-4 text-yellow-400" />, color: "bg-yellow-400" },
            { label: "Truths Answered", value: stats.truthsAnswered, icon: <Brain className="h-4 w-4 text-[var(--neon-cyan)]" />, color: "bg-[var(--neon-cyan)]" },
            { label: "Dares Completed", value: stats.daresCompleted, icon: <Flame className="h-4 w-4 text-[var(--neon-pink)]" />, color: "bg-[var(--neon-pink)]" },
            { label: "Dares Refused", value: stats.daresRefused, icon: <Shield className="h-4 w-4 text-orange-400" />, color: "bg-orange-400" },
            { label: "Punishments", value: stats.punishmentsReceived, icon: <Skull className="h-4 w-4 text-red-400" />, color: "bg-red-400" },
            { label: "Best Streak", value: stats.longestStreak, icon: <Zap className="h-4 w-4 text-yellow-400" />, color: "bg-yellow-400" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                {stat.icon}
                <span className="text-sm text-white/90">{stat.label}</span>
              </div>
              <span className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-white">
                {stat.value}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Account Section */}
      <div className="glass-panel mt-8 rounded-2xl p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Account</p>
        {!isSupabaseConfigured ? (
          <p className="mt-2 text-sm text-white/85">
            Add Supabase keys in <code className="text-[var(--neon-cyan)]">.env.local</code> to enable
            Google sign-in and guest accounts.
          </p>
        ) : !authReady ? (
          <p className="mt-2 text-sm text-[var(--muted)]">Connecting…</p>
        ) : user ? (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt=""
                  className="h-12 w-12 rounded-full border border-white/20 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <UserCircle2 className="h-12 w-12 text-[var(--neon-cyan)]" strokeWidth={1.25} />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {user.displayName || (user.isAnonymous ? "Guest" : "Signed in")}
                </p>
                {user.email ? (
                  <p className="truncate text-xs text-[var(--muted)]">{user.email}</p>
                ) : user.isAnonymous ? (
                  <p className="text-xs text-[var(--muted)]">Anonymous session</p>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              disabled={authBusy}
              onClick={() => void onSignOut()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/5 disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            <button
              type="button"
              disabled={authBusy}
              onClick={() => void onGoogle()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm font-bold text-gray-900 shadow-lg transition hover:bg-white/95 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4 text-violet-600" />
              Continue with Google
            </button>
            <button
              type="button"
              disabled={authBusy}
              onClick={() => void onGuest()}
              className="glass-panel glow-border-cyan flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold uppercase tracking-wider text-[var(--neon-cyan)] transition hover:bg-[var(--neon-cyan)]/10 disabled:opacity-50"
            >
              <LogIn className="h-4 w-4" />
              Play as guest
            </button>
            {authError ? <p className="text-center text-xs text-red-300">{authError}</p> : null}
          </div>
        )}
      </div>
    </div>
  );
}
