"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense, useEffect } from "react";
import { LogIn, PlusCircle } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import { useAuthStore } from "@/store/useAuthStore";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { createRoom, joinRoom as joinRoomRemote } from "@/lib/supabase/rooms";
import { signInAsGuest, signInWithGoogle } from "@/lib/supabase/auth";
import { randomCode } from "@/lib/utils";

function RoomSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusJoin = searchParams.get("mode") === "join";
  const roomCode = useGameStore((s) => s.roomCode);

  // If a room already exists, redirect to lobby
  useEffect(() => {
    if (roomCode) {
      router.replace("/lobby");
    }
  }, [roomCode, router]);
  const [joinCode, setJoinCode] = useState("");
  const [roomName, setRoomName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [vibe, setVibe] = useState<string | null>("chill");
  const [selectionMode, setSelectionMode] = useState<"choice" | "random" | "alternating">("choice");

  const setRoomFromCreate = useGameStore((s) => s.setRoomFromCreate);
  const joinRoom = useGameStore((s) => s.joinRoom);
  const setRoomMeta = useGameStore((s) => s.setRoomMeta);
  const setSelfId = useGameStore((s) => s.setSelfId);
  const displayName = useGameStore((s) => s.displayName);
  const avatarEmoji = useGameStore((s) => s.avatarEmoji);
  const avatarColor = useGameStore((s) => s.avatarColor);

  const authReady = useAuthStore((s) => s.ready);
  const user = useAuthStore((s) => s.user);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const vibes = [
    { id: "classic", label: "Classic", emoji: "🎲" },
    { id: "funny", label: "Funny", emoji: "😂" },
    { id: "party", label: "Party", emoji: "🎉" },
    { id: "wild", label: "Wild", emoji: "🔥" },
    { id: "deep", label: "Deep", emoji: "🧠" },
    { id: "extreme", label: "Extreme", emoji: "😈" },
  ] as const;

  async function onJoin() {
    setError(null);
    const code = (joinCode || "").replace(/\s/g, "").toUpperCase().slice(0, 8) || "DEMO";

    if (!isSupabaseConfigured) {
      joinRoom(code);
      router.push("/lobby");
      return;
    }
    if (!user) {
      setBusy(true);
      try {
        const { data, error: authError } = await signInAsGuest();
        if (authError) throw authError;
        if (!data.user) throw new Error("Failed to sign in as guest.");
        // Wait a moment for auth state to propagate
        await new Promise(r => setTimeout(r, 500));
        
        await joinRoomRemote({
          roomCode: code,
          uid: data.user.id,
          name: displayName,
          avatarEmoji,
          avatarColor,
        });
        setSelfId(data.user.id);
        setRoomMeta({ roomCode: code });
        router.push("/lobby");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to join room.");
      } finally {
        setBusy(false);
      }
      return;
    }

    setBusy(true);
    try {
      await joinRoomRemote({
        roomCode: code,
        uid: user.uid,
        name: displayName,
        avatarEmoji,
        avatarColor,
      });
      setSelfId(user.uid);
      setRoomMeta({ roomCode: code });
      router.push("/lobby");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to join room.");
    } finally {
      setBusy(false);
    }
  }

  async function onCreate() {
    console.log("onCreate called!");
    setError(null);

    if (!isSupabaseConfigured) {
      console.log("Supabase not configured. Creating local room...");
      setRoomFromCreate(roomName, maxPlayers, vibe, selectionMode);
      console.log("Local room created in store. Routing to lobby...");
      router.push("/lobby");
      return;
    }
    if (!user) {
      setBusy(true);
      try {
        const { data, error: authError } = await signInAsGuest();
        if (authError) throw authError;
        if (!data.user) throw new Error("Failed to sign in as guest.");
        // Wait a moment for auth state to propagate
        await new Promise(r => setTimeout(r, 500));

        const code = randomCode(5);
        await createRoom({
          roomCode: code,
          roomName,
          maxPlayers,
          vibe,
          selectionMode,
          hostUid: data.user.id,
          hostName: displayName,
          hostAvatarEmoji: avatarEmoji,
          hostAvatarColor: avatarColor,
        });
        setSelfId(data.user.id);
        setRoomMeta({ roomCode: code, roomName: roomName || "Party Room", maxPlayers, vibe, selectionMode });
        router.push("/lobby");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to create room.");
      } finally {
        setBusy(false);
      }
      return;
    }

    setBusy(true);
    try {
      const code = randomCode(5);
      await createRoom({
        roomCode: code,
        roomName,
        maxPlayers,
        vibe,
        selectionMode,
        hostUid: user.uid,
        hostName: displayName,
        hostAvatarEmoji: avatarEmoji,
        hostAvatarColor: avatarColor,
      });
      setSelfId(user.uid);
      setRoomMeta({ roomCode: code, roomName: roomName || "Party Room", maxPlayers, vibe, selectionMode });
      router.push("/lobby");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create room.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pb-8 pt-4">
      {/* Connectivity Status */}
      <div className={`mb-6 glass-panel flex flex-col items-center justify-between gap-4 overflow-hidden rounded-2xl border p-4 transition-all ${
        user 
          ? "border-green-500/30 bg-green-500/5" 
          : isSupabaseConfigured 
            ? "border-blue-500/30 bg-blue-500/5" 
            : "border-yellow-500/30 bg-yellow-500/5"
      }`}>
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-2.5 w-2.5 rounded-full ${
              user 
                ? "bg-green-500 shadow-[0_0_8px_green]" 
                : isSupabaseConfigured 
                  ? "bg-blue-500 animate-pulse shadow-[0_0_8px_blue]" 
                  : "bg-yellow-500 shadow-[0_0_8px_yellow]"
            }`} />
            <span className="text-xs font-bold uppercase tracking-widest text-white">
              {user 
                ? "Online Mode" 
                : isSupabaseConfigured 
                  ? "Server Connected" 
                  : "Offline Mode"}
            </span>
          </div>
          {!user && (
            <span className="text-[10px] font-medium uppercase text-blue-500/80">
              {isSupabaseConfigured ? "Sign in to Play" : "Local Only"}
            </span>
          )}
        </div>
          
          {!user && (
            <div className="flex w-full flex-col gap-2">
              <p className="text-[11px] leading-tight text-[var(--muted)]">
                To play with friends across devices, you need to be connected.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => void signInAsGuest()}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-white/10"
                >
                  Guest Connect
                </button>
                <button
                  onClick={() => void signInWithGoogle()}
                  className="flex-1 rounded-xl bg-white py-2 text-[10px] font-bold uppercase tracking-wider text-black hover:bg-white/90"
                >
                  Google
                </button>
              </div>
            </div>
          )}
        </div>

      <div className="glass-panel glow-border-cyan relative overflow-hidden rounded-3xl p-5">
        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[var(--neon-cyan)]/15 blur-2xl" />
        <h2 className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold uppercase tracking-wide text-[var(--neon-cyan)]">
          Join a Party
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Got an invite? Enter the code below.</p>
        <input
          autoFocus={focusJoin}
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          placeholder="ENTER CODE"
          className="mt-4 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-4 font-[family-name:var(--font-space-grotesk)] text-lg font-bold uppercase tracking-widest text-white outline-none transition placeholder:text-white/25 focus:border-[var(--neon-cyan)] focus:shadow-[0_0_20px_rgba(0,251,251,0.25)]"
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => void onJoin()}
          className="glass-panel glow-border-cyan mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-[family-name:var(--font-space-grotesk)] text-sm font-bold uppercase tracking-wider text-[var(--neon-cyan)]"
        >
          <LogIn className="h-5 w-5" />
          Enter Room
        </button>
      </div>

      <div className="relative my-8 flex items-center justify-center">
        <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
        <span className="relative bg-[var(--bg-deep)] px-3 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
          OR
        </span>
      </div>

      <div className="glass-panel rounded-3xl border border-[var(--neon-pink)]/25 p-5 shadow-[0_0_24px_rgba(255,65,175,0.12)]">
        <h2 className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold uppercase tracking-wide text-[var(--neon-pink-bright)]">
          Create a Party
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Host a new game and invite your friends.</p>

        <label className="mt-5 block">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--neon-pink)]">
            Room name
          </span>
          <input
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="e.g. Midnight Madness"
            className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[var(--neon-pink)] focus:shadow-[0_0_16px_rgba(255,65,175,0.2)]"
          />
        </label>

        <label className="mt-5 block">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--neon-pink)]">
            Player limit
          </span>
          <div className="mt-2 flex items-center gap-4">
            <input
              type="range"
              min={2}
              max={10}
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
              className="h-2 flex-1 accent-[var(--neon-pink)]"
            />
            <span className="w-8 text-center font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-[var(--neon-pink)]">
              {maxPlayers}
            </span>
          </div>
          <div className="mt-1 flex justify-between text-[10px] uppercase text-[var(--muted)]">
            <span>2</span>
            <span>10 max</span>
          </div>
        </label>

        <div className="mt-5">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--neon-pink)]">
            Vibe (optional)
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {vibes.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVibe(v.id)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition ${
                  vibe === v.id
                    ? "border-[var(--neon-pink)] bg-[var(--neon-pink)] text-white shadow-[0_0_12px_var(--neon-pink)]"
                    : "border-white/20 text-[var(--muted)] hover:border-[var(--neon-pink)]/50"
                }`}
              >
                <span>{v.emoji}</span>
                <span>{v.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--neon-pink)]">
            Game Mode
          </span>
          <div className="mt-2 flex flex-col gap-2">
            {[
              { id: "choice", label: "Players Choice", desc: "Players pick Truth or Dare" },
              { id: "random", label: "Reveal Fate", desc: "50/50 Random Assignment" },
              { id: "alternating", label: "Alternating", desc: "Truth, then Dare, then Truth..." },
            ].map((mode) => (
              <label
                key={mode.id}
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${
                  selectionMode === mode.id
                    ? "border-[var(--neon-pink)] bg-[var(--neon-pink)]/10"
                    : "border-white/10 bg-white/5 hover:border-white/30"
                }`}
              >
                <div>
                  <p className={`text-sm font-bold ${selectionMode === mode.id ? "text-[var(--neon-pink)]" : "text-white"}`}>
                    {mode.label}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">{mode.desc}</p>
                </div>
                <input
                  type="radio"
                  name="selectionMode"
                  value={mode.id}
                  checked={selectionMode === mode.id}
                  onChange={() => setSelectionMode(mode.id as any)}
                  className="hidden"
                />
                <div className={`flex h-4 w-4 items-center justify-center rounded-full border ${selectionMode === mode.id ? "border-[var(--neon-pink)]" : "border-white/40"}`}>
                  {selectionMode === mode.id && <div className="h-2 w-2 rounded-full bg-[var(--neon-pink)]" />}
                </div>
              </label>
            ))}
          </div>
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={() => void onCreate()}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#ff40a0] to-[#b040ff] py-4 font-[family-name:var(--font-space-grotesk)] text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_24px_rgba(255,64,160,0.4)]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
            <PlusCircle className="h-5 w-5" />
          </span>
          Generate Room
        </button>

        {error ? <p className="mt-3 text-center text-xs text-red-300">{error}</p> : null}
      </div>
    </div>
  );
}

export default function RoomPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[var(--muted)]">Loading…</div>}>
      <RoomSetupContent />
    </Suspense>
  );
}
