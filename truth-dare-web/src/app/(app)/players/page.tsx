"use client";

import Link from "next/link";
import { Crown } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";

export default function PlayersPage() {
  const players = useGameStore((s) => s.players);
  const roomCode = useGameStore((s) => s.roomCode);

  return (
    <div className="pb-8 pt-4">
      <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-white">
        Players
      </h2>
      {!roomCode ? (
        <p className="mt-4 text-sm text-[var(--muted)]">
          Join or create a room to see everyone here.{" "}
          <Link href="/room" className="text-[var(--neon-cyan)] underline">
            Go to room setup
          </Link>
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {players.map((p) => (
            <li key={p.id} className="glass-panel flex items-center gap-3 rounded-2xl p-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${p.avatarColor || "from-pink-500 to-purple-600"} text-xl`}>
                {p.avatarEmoji || p.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">
                  {p.name}
                  {p.isHost && (
                    <Crown className="ml-1 inline h-4 w-4 text-[var(--neon-pink)]" />
                  )}
                </p>
                <p className="text-xs text-[var(--muted)]">{p.ready ? "Ready" : "Not ready"}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/custom"
        className="mt-8 block w-full rounded-2xl border border-[var(--neon-cyan)]/40 py-4 text-center font-[family-name:var(--font-space-grotesk)] text-sm font-bold uppercase tracking-wider text-[var(--neon-cyan)]"
      >
        My custom prompts
      </Link>
    </div>
  );
}
