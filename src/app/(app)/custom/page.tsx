"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import type { PromptCategory } from "@/data/defaultPrompts";
import { addCustomPromptToRoom } from "@/lib/supabase/rooms";
import { isSupabaseConfigured } from "@/lib/supabase/client";

const categories: PromptCategory[] = ["funny", "spicy", "deep", "extreme"];

export default function CustomPromptsPage() {
  const customTruths = useGameStore((s) => s.customTruths);
  const customDares = useGameStore((s) => s.customDares);
  const addCustomPrompt = useGameStore((s) => s.addCustomPrompt);
  const removeCustomPrompt = useGameStore((s) => s.removeCustomPrompt);

  const [tab, setTab] = useState<"truth" | "dare">("truth");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [cat, setCat] = useState<PromptCategory>("funny");
  const [editingId, setEditingId] = useState<string | null>(null);

  const list = tab === "truth" ? customTruths : customDares;

  return (
    <div className="relative pb-28 pt-4">
      <div className="flex rounded-2xl border border-white/10 bg-black/40 p-1">
        <button
          type="button"
          onClick={() => setTab("truth")}
          className={`flex-1 rounded-xl py-3 font-[family-name:var(--font-space-grotesk)] text-xs font-bold uppercase tracking-wider ${
            tab === "truth"
              ? "border border-[var(--neon-cyan)] text-[var(--neon-cyan)] shadow-[0_0_16px_rgba(0,251,251,0.15)]"
              : "text-[var(--muted)]"
          }`}
        >
          My truths
        </button>
        <button
          type="button"
          onClick={() => setTab("dare")}
          className={`flex-1 rounded-xl py-3 font-[family-name:var(--font-space-grotesk)] text-xs font-bold uppercase tracking-wider ${
            tab === "dare"
              ? "border border-[var(--neon-cyan)] text-[var(--neon-cyan)] shadow-[0_0_16px_rgba(0,251,251,0.15)]"
              : "text-[var(--muted)]"
          }`}
        >
          My dares
        </button>
      </div>

      <ul className="mt-6 flex flex-col gap-3">
        {list.length === 0 && (
          <li className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-[var(--muted)]">
            No custom {tab}s yet. Tap + to add one.
          </li>
        )}
        {list.map((item) => (
          <li
            key={item.id}
            className="glass-panel glow-border-cyan relative rounded-2xl border border-[var(--neon-cyan)]/35 p-4"
          >
            <div className="absolute right-3 top-3 flex gap-2">
              <button
                type="button"
                aria-label="Edit"
                className="text-[var(--neon-cyan)]"
                onClick={() => {
                  setDraft(item.text);
                  setCat(item.category);
                  setTab(item.type);
                  setEditingId(item.id);
                  setSheetOpen(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Delete"
                className="text-[var(--neon-pink)]"
                onClick={() => removeCustomPrompt(item.id, item.type)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <p className="pr-16 text-sm leading-relaxed text-white">{item.text}</p>
            <span className="mt-3 inline-block rounded-full border border-[var(--neon-cyan)]/50 bg-[var(--neon-cyan)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--neon-cyan)]">
              {item.category}
            </span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => {
          setDraft("");
          setCat("funny");
          setEditingId(null);
          setSheetOpen(true);
        }}
        className="fixed bottom-24 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--neon-pink)] to-[var(--neon-purple)] text-white shadow-[0_0_24px_rgba(255,65,175,0.5)]"
        aria-label="New prompt"
      >
        <Plus className="h-7 w-7" />
      </button>

      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm"
            onClick={() => {
              setSheetOpen(false);
              setEditingId(null);
            }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28 }}
              className="absolute bottom-0 left-0 right-0 max-h-[85dvh] overflow-auto rounded-t-3xl border border-white/10 bg-[#1c1b1b] p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold uppercase tracking-wide text-[var(--neon-cyan)] text-glow-cyan">
                + New {tab}
              </h3>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Type your custom ${tab} prompt…`}
                rows={4}
                className="mt-4 w-full resize-none rounded-2xl border border-white/15 bg-black/50 p-4 text-sm text-white outline-none focus:border-[var(--neon-cyan)] focus:shadow-[0_0_20px_rgba(0,251,251,0.2)]"
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCat(c)}
                    className={`rounded-full px-4 py-2 text-xs font-bold uppercase ${
                      cat === c
                        ? "bg-[var(--neon-cyan)] text-black"
                        : "border border-[var(--neon-pink)]/50 text-[var(--muted)]"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={async () => {
                  const t = draft.trim();
                  if (!t) return;
                  if (editingId) removeCustomPrompt(editingId, tab);
                  
                  // Optimistic local add
                  addCustomPrompt({ type: tab, text: t, category: cat });
                  
                  // Room sync if active
                  const roomCode = useGameStore.getState().roomCode;
                  if (roomCode && isSupabaseConfigured) {
                    try {
                      await addCustomPromptToRoom(roomCode, {
                        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
                        type: tab,
                        text: t,
                        category: cat,
                      });
                    } catch (e) {
                      console.error("Failed to sync custom prompt to room:", e);
                    }
                  }
                  
                  setSheetOpen(false);
                  setDraft("");
                  setEditingId(null);
                }}
                className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-cyan-dim)] py-4 font-[family-name:var(--font-space-grotesk)] text-sm font-bold uppercase tracking-wider text-black"
              >
                Save prompt
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
