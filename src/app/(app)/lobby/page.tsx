"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Crown, Lock, Share2 } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { subscribePlayers, subscribeRoom, subscribeBroadcast, setReady, startGame as startGameRemote } from "@/lib/supabase/rooms";
import { useAuthStore } from "@/store/useAuthStore";
import { ShareRoom } from "@/components/game/ShareRoom";

export default function LobbyPage() {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const router = useRouter();
  const roomCode = useGameStore((s) => s.roomCode);
  const players = useGameStore((s) => s.players);
  const toggleReady = useGameStore((s) => s.toggleReady);
  const startGame = useGameStore((s) => s.startGame);
  const maxPlayers = useGameStore((s) => s.maxPlayers);
  const setPlayers = useGameStore((s) => s.setPlayers);
  const setRoomMeta = useGameStore((s) => s.setRoomMeta);
  const setGameStarted = useGameStore((s) => s.setGameStarted);
  const setBroadcastChannel = useGameStore((s) => s.setBroadcastChannel);
  const selfId = useGameStore((s) => s.selfId);
  const gameStarted = useGameStore((s) => s.gameStarted);

  const user = useAuthStore((s) => s.user);

  const copyCode = useCallback(() => {
    if (roomCode) void navigator.clipboard.writeText(roomCode);
  }, [roomCode]);

  useEffect(() => {
    if (gameStarted) {
      router.push("/play");
    }
  }, [gameStarted, router]);

  useEffect(() => {
    if (!roomCode || !isSupabaseConfigured) return;

    const unsubRoom = subscribeRoom(roomCode, (room) => {
      if (!room) return;
      setRoomMeta({
        roomCode: room.id,
        roomName: room.roomName,
        maxPlayers: room.maxPlayers,
        vibe: room.vibe,
        selectionMode: room.selectionMode,
        customPrompts: room.customPrompts || [],
      });
      if (room.status === "playing") {
        setGameStarted(true);
        router.push("/play");
      }
    });

    const unsubPlayers = subscribePlayers(roomCode, (ps) => {
      setPlayers(
        ps.map((p) => ({
          id: p.uid,
          name: p.name,
          avatarEmoji: p.avatar_emoji || p.avatarEmoji,
          avatarColor: p.avatar_color || p.avatarColor,
          isHost: p.is_host ?? p.isHost,
          ready: p.ready,
          score: p.score || 0,
        }))
      );
    });

    const unsubBroadcast = subscribeBroadcast(
      roomCode,
      () => {},
      (state) => {
        useGameStore.getState().syncFromRemote(state);
      }
    );

    setBroadcastChannel(unsubBroadcast);

    return () => {
      unsubRoom();
      unsubPlayers();
      unsubBroadcast.unsubscribe();
      setBroadcastChannel(null);
    };
  }, [roomCode, router, setPlayers, setRoomMeta, setBroadcastChannel, selfId]);

  if (!roomCode) {
    return (
      <div className="py-16 text-center">
        <p className="text-[var(--muted)]">No active room.</p>
        <Link href="/room" className="mt-4 inline-block text-[var(--neon-cyan)] underline">
          Create or join a room
        </Link>
      </div>
    );
  }

  const me = players.find((p) => p.id === selfId);
  const allReady = players.length > 0 && players.every((p) => p.ready);
  const canStart = me?.isHost && allReady;

  return (
    <div className="pb-8 pt-4">
      <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
        Room code
      </p>
      <div className="mt-2 flex items-center justify-center gap-3">
        <span className="font-[family-name:var(--font-space-grotesk)] text-4xl font-bold tracking-widest text-[var(--neon-cyan)] text-glow-cyan">
          {roomCode}
        </span>
        <button
          type="button"
          onClick={copyCode}
          className="rounded-xl border border-white/15 p-2 text-[var(--neon-cyan)] hover:bg-white/5"
          aria-label="Copy room code"
        >
          <Copy className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => setIsShareOpen(true)}
          className="rounded-xl border border-white/15 p-2 text-[var(--neon-cyan)] hover:bg-white/5"
          aria-label="Share room"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-[var(--muted)]">Waiting for players…</p>

      <div className="glass-panel mt-8 rounded-2xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-semibold text-white">Players</span>
          <span className="rounded-lg bg-[var(--neon-pink)]/20 px-2 py-0.5 text-xs font-bold text-[var(--neon-pink-bright)]">
            {players.length} / {maxPlayers}
          </span>
        </div>
        <ul className="flex flex-col gap-2">
          {players.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-3"
            >
                <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${p.avatarColor || "from-pink-500 to-purple-600"} text-lg`}>
                  {p.avatarEmoji || p.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <span className="font-medium text-white">
                    {p.name}
                    {p.id === selfId ? " (You)" : ""}
                  </span>
                  {p.isHost && (
                    <Crown className="ml-1 inline h-3.5 w-3.5 text-[var(--neon-pink)]" />
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (p.id !== selfId) return;
                  toggleReady();
                  if (isSupabaseConfigured && user && roomCode) {
                    const next = !p.ready;
                    void setReady(roomCode, user.uid, next);
                  }
                }}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition ${p.ready ? "bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)] shadow-[0_0_8px_rgba(0,251,251,0.2)]" : "bg-white/10 text-[var(--muted)] hover:bg-white/15"}`}
                disabled={p.id !== selfId}
              >
                <span className={`h-3 w-3 rounded-full ${p.ready ? "bg-[var(--neon-cyan)] shadow-[0_0_8px_var(--neon-cyan)]" : "bg-white/30"}`} />
                <span className="text-xs font-bold uppercase tracking-wider">{p.ready ? "Ready" : "Tap to Ready"}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="glass-panel mt-6 rounded-2xl p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Lobby chat</p>
        <p className="mt-2 text-xs text-[var(--muted)] italic">
          Messages will appear here when players join...
        </p>
      </div>

      <button
        type="button"
        disabled={!canStart}
        onClick={() => {
          startGame();
          if (isSupabaseConfigured && roomCode) {
            void startGameRemote(roomCode);
          }
          router.push("/play");
        }}
        className={`mt-8 flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-[family-name:var(--font-space-grotesk)] text-sm font-bold uppercase tracking-wider ${
          canStart
            ? "bg-gradient-to-r from-[#ff40a0] to-[#b040ff] text-white shadow-[0_0_24px_rgba(255,64,160,0.35)]"
            : "cursor-not-allowed bg-white/10 text-white/40"
        }`}
      >
        <Lock className="h-4 w-4" />
        Continue to the Party
      </button>
      {!canStart && (
        <p className="mt-2 text-center text-xs text-[var(--muted)]">Need all players ready to start</p>
      )}

      <ShareRoom roomCode={roomCode} isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
    </div>
  );
}
