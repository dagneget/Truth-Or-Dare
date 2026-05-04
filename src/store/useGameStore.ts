"use client";

import { create } from "zustand";
import { randomCode } from "@/lib/utils";
import {
  DEFAULT_DARES,
  DEFAULT_TRUTHS,
  DEFAULT_PUNISHMENTS,
  type PromptCategory,
} from "@/data/defaultPrompts";
import { updateGameState, sendBroadcastReaction, sendStateBroadcast } from "@/lib/supabase/rooms";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export type Player = {
  id: string;
  name: string;
  avatarEmoji: string;
  avatarColor: string;
  isHost: boolean;
  ready: boolean;
  score: number;
};

export type CustomPrompt = {
  id: string;
  type: "truth" | "dare";
  text: string;
  category: PromptCategory;
};

type GamePhase =
  | "idle"
  | "spinning"
  | "choose"
  | "revealed"
  | "voting"
  | "punishment";

type ChallengeType = "truth" | "dare" | null;

type GameState = {
  selfId: string;
  displayName: string;
  roomCode: string | null;
  roomName: string;
  maxPlayers: number;
  vibe: string | null;
  selectionMode: "choice" | "random" | "alternating";
  players: Player[];
  gameStarted: boolean;
  bottleRotation: number;
  selectedPlayerId: string | null;
  phase: GamePhase;
  challengeType: ChallengeType;
  currentPrompt: string | null;
  timerSeconds: number;
  timerEnabled: boolean;
  dareTimeLimit: number;
  punishmentText: string | null;
  lastChallengeType: ChallengeType;
  avatarEmoji: string;
  avatarColor: string;
  stats: {
    gamesPlayed: number;
    truthsAnswered: number;
    daresCompleted: number;
    daresRefused: number;
    punishmentsReceived: number;
    currentStreak: number;
    longestStreak: number;
  };
  customTruths: CustomPrompt[];
  customDares: CustomPrompt[];
  roomCustomPrompts: CustomPrompt[];
  chatUnread: boolean;
  dareCamActive: boolean;
  votes: Record<string, "pass" | "fail">;
  reactions: { id: string; emoji: string; senderId?: string; x?: number }[];

  setSelfId: (id?: string) => void;
  setDisplayName: (name: string) => void;
  setVote: (vote: "pass" | "fail") => void;
  startVoting: () => void;
  resolveVoting: () => void;
  sendReaction: (emoji: string) => void;
  clearReactions: () => void;
  setRoomMeta: (meta: {
    roomCode: string | null;
    roomName?: string;
    maxPlayers?: number;
    vibe?: string | null;
    selectionMode?: "choice" | "random" | "alternating";
    customPrompts?: CustomPrompt[];
  }) => void;
  setPlayers: (players: Player[]) => void;
  setRoomFromCreate: (name: string, maxPlayers: number, vibe: string | null, selectionMode: "choice" | "random" | "alternating") => void;
  joinRoom: (code: string) => void;
  leaveRoom: () => void;
  toggleReady: () => void;
  startGame: () => void;
  spinBottle: () => void;
  pickChallenge: (type?: "truth" | "dare" | "random" | "alternating") => void;
  pickTruth: () => void;
  pickDare: () => void;
  completeChallenge: () => void;
  refuseChallenge: () => void;
  setPunishment: (text: string) => void;
  randomPunishment: () => void;
  confirmPunishmentDone: () => void;
  addCustomPrompt: (p: Omit<CustomPrompt, "id">) => void;
  removeCustomPrompt: (id: string, type: "truth" | "dare") => void;
  setTimerEnabled: (v: boolean) => void;
  setDareTimeLimit: (s: number) => void;
  setAvatarEmoji: (emoji: string) => void;
  setAvatarColor: (color: string) => void;
  tickTimer: () => void;
  resetTimer: () => void;
  setChatUnread: (v: boolean) => void;
  syncFromRemote: (state: Partial<GameState>) => void;
  setDareCamActive: (active: boolean) => void;
  setGameStarted: (started: boolean) => void;
  receiveReaction: (reaction: { id: string, emoji: string, senderId?: string, x?: number }) => void;
  receiveChatMessage: (msg: { uid: string, name: string, content: string, created_at: string }) => void;
  broadcastChannel: any;
  setBroadcastChannel: (channel: any) => void;
};

export const AVATAR_EMOJIS = ["🔥", "😈", "👻", "🎭", "💀", "🦊", "🐺", "🌶️", "🎯", "⚡", "🦁", "🐉", "🎲", "💎", "🌙", "🍀"];
export const AVATAR_COLORS = [
  "from-pink-500 to-purple-600",
  "from-cyan-400 to-blue-600",
  "from-orange-400 to-red-600",
  "from-green-400 to-teal-600",
  "from-yellow-400 to-orange-500",
  "from-violet-500 to-indigo-600",
  "from-rose-400 to-pink-600",
  "from-emerald-400 to-cyan-500",
];

function initialHostPlayer(host: string, emoji: string, color: string): Player[] {
  return [
    { id: "me", name: host, avatarEmoji: emoji, avatarColor: color, isHost: true, ready: true, score: 0 },
  ];
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

async function broadcastState(state: GameState, highFrequency = false) {
  if (!isSupabaseConfigured || !state.roomCode) return;

  const payload = {
    phase: state.phase,
    bottleRotation: state.bottleRotation,
    selectedPlayerId: state.selectedPlayerId,
    challengeType: state.challengeType,
    currentPrompt: state.currentPrompt,
    timerSeconds: state.timerSeconds,
    punishmentText: state.punishmentText,
    dareCamActive: state.dareCamActive,
    votes: state.votes,
    reactions: state.reactions,
    gameStarted: state.gameStarted,
    lastUpdateBy: state.selfId,
  };

  // If high frequency, use Broadcast for speed
  if (highFrequency && state.broadcastChannel) {
    sendStateBroadcast(state.broadcastChannel, payload);
  }

  // Always persist to DB for reliability
  await updateGameState(state.roomCode, payload);
}

export const useGameStore = create<GameState>()((set, get) => ({
  selfId: "me",
  displayName: "Player",
  roomCode: null,
  roomName: "",
  maxPlayers: 8,
  vibe: null,
  selectionMode: "choice",
  players: [],
  gameStarted: false,
  bottleRotation: 0,
  selectedPlayerId: null,
  phase: "idle",
  challengeType: null,
  currentPrompt: null,
  timerSeconds: 0,
  timerEnabled: true,
  dareTimeLimit: 15,
  punishmentText: null,
  lastChallengeType: null,
  avatarEmoji: "🔥",
  avatarColor: "from-pink-500 to-purple-600",
  stats: {
    gamesPlayed: 0,
    truthsAnswered: 0,
    daresCompleted: 0,
    daresRefused: 0,
    punishmentsReceived: 0,
    currentStreak: 0,
    longestStreak: 0,
  },
  customDares: [],
  customTruths: [],
  roomCustomPrompts: [],
  chatUnread: false,
  dareCamActive: false,
  votes: {},
  reactions: [],
  broadcastChannel: null,
  setBroadcastChannel: (channel: any) => set({ broadcastChannel: channel }),
  setGameStarted: (started: boolean) => set({ gameStarted: started }),

  sendReaction: (emoji: string) => {
    const { selfId, broadcastChannel } = get();
    const reaction = { 
      id: Math.random().toString(), 
      emoji, 
      senderId: selfId,
      x: 20 + Math.random() * 60 
    };

    set((s: GameState) => ({ reactions: [...s.reactions.slice(-19), reaction] }));
    
    if (broadcastChannel) {
      sendBroadcastReaction(broadcastChannel, reaction);
    }
  },
  receiveReaction: (reaction: any) => set((s: GameState) => ({ reactions: [...s.reactions.slice(-19), reaction] })),
  receiveChatMessage: (msg: any) => {
    // Chat logic can go here
  },

  setSelfId: (id?: string) => {
    let finalId = id;
    if (!finalId && typeof window !== 'undefined') {
      finalId = localStorage.getItem('temp_uid') ?? undefined;
      if (!finalId) {
        finalId = 'guest_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('temp_uid', finalId);
      }
    }
    set({ selfId: finalId || "me" });
  },
  setDisplayName: (name: string) => set({ displayName: name.trim() || "Player" }),

  setVote: (vote: "pass" | "fail") => {
    const { selfId, votes } = get();
    set({ votes: { ...votes, [selfId]: vote } });
    void broadcastState(get());
  },

  clearReactions: () => set({ reactions: [] }),

  startVoting: () => {
    set({ phase: "voting", votes: {} });
    void broadcastState(get());
  },

  resolveVoting: () => {
    const { votes } = get();
    const voteList = Object.values(votes);
    const passes = voteList.filter((v) => v === "pass").length;
    const fails = voteList.filter((v) => v === "fail").length;
      
    if (passes >= fails) {
      get().completeChallenge();
    } else {
      get().refuseChallenge();
    }
  },

  setRoomMeta: (meta: any) =>
    set((s: GameState) => ({
      roomCode: meta.roomCode,
      roomName: meta.roomName ?? s.roomName,
      maxPlayers: meta.maxPlayers ?? s.maxPlayers,
      vibe: meta.vibe ?? s.vibe,
      selectionMode: meta.selectionMode ?? s.selectionMode,
      roomCustomPrompts: meta.customPrompts ?? s.roomCustomPrompts,
    })),

  setPlayers: (players: Player[]) => set({ players }),

  setRoomFromCreate: (name: string, maxPlayers: number, vibe: string | null, selectionMode: "choice" | "random" | "alternating") => {
    const code = randomCode(5);
    const { displayName: host, avatarEmoji, avatarColor } = get();
    set({
      roomCode: code,
      roomName: name || "Party Room",
      maxPlayers,
      vibe,
      selectionMode,
      players: initialHostPlayer(host, avatarEmoji, avatarColor),
      gameStarted: false,
      phase: "idle",
      selectedPlayerId: null,
      challengeType: null,
      currentPrompt: null,
    });
  },

  joinRoom: (code: string) => {
    const clean = code.replace(/\s/g, "").toUpperCase().slice(0, 8);
    const { displayName: name, avatarEmoji, avatarColor } = get();
    set({
      roomCode: clean || randomCode(5),
      roomName: "Joined Room",
      players: [
        { id: get().selfId, name, avatarEmoji, avatarColor, isHost: false, ready: false, score: 0 },
      ],
      gameStarted: false,
      phase: "idle",
    });
  },

  leaveRoom: () =>
    set({
      roomCode: null,
      players: [],
      gameStarted: false,
      phase: "idle",
      selectedPlayerId: null,
      challengeType: null,
      currentPrompt: null,
      punishmentText: null,
    }),

  toggleReady: () => {
    const me = get().selfId;
    set((s: GameState) => ({
      players: s.players.map((p: Player) => (p.id === me ? { ...p, ready: !p.ready } : p)),
    }));
  },

  startGame: () => {
    const { players } = get();
    if (!players.length) return;
    const me = players.find((p: Player) => p.id === get().selfId);
    if (!me?.isHost) return;
    const allReady = players.every((p: Player) => p.ready);
    if (!allReady) return;
    set((s: GameState) => ({
      gameStarted: true,
      phase: "idle",
      selectedPlayerId: null,
      challengeType: null,
      currentPrompt: null,
      stats: { ...s.stats, gamesPlayed: s.stats.gamesPlayed + 1 },
    }));
    void broadcastState(get());
  },

  spinBottle: () => {
    const { players, gameStarted } = get();
    if (!gameStarted || players.length === 0) return;
    const extraTurns = Math.floor(3 + Math.random() * 4);
    const segment = 360 / players.length;
    const winnerIndex = Math.floor(Math.random() * players.length);

    const currentRotation = get().bottleRotation;
    const baseRotation = Math.ceil(currentRotation / 360) * 360;
    const newRotation = baseRotation + (extraTurns * 360) + (winnerIndex * segment);

    set({
      phase: "spinning",
      bottleRotation: newRotation,
      selectedPlayerId: players[winnerIndex]!.id,
      challengeType: null,
      currentPrompt: null,
    });

    void broadcastState(get(), true);

    window.setTimeout(() => {
      set({
        phase: "choose",
        timerSeconds: 10,
      });
      void broadcastState(get());
    }, 3200);
  },

  pickChallenge: (type?: "truth" | "dare" | "random" | "alternating") => {
    const { customTruths, customDares, roomCustomPrompts, lastChallengeType, timerEnabled, dareTimeLimit, vibe } = get();

    let chosenType: "truth" | "dare";
    if (type === "truth" || type === "dare") {
      chosenType = type;
    } else if (type === "alternating") {
      chosenType = lastChallengeType === "truth" ? "dare" : "truth";
    } else {
      chosenType = Math.random() > 0.5 ? "truth" : "dare";
    }

    const allDefaults = chosenType === "truth" ? DEFAULT_TRUTHS : DEFAULT_DARES;

    let filteredDefaults = allDefaults;
    if (vibe && vibe !== "classic") {
      filteredDefaults = allDefaults.filter((d: any) => d.category === vibe);
      if (filteredDefaults.length === 0) filteredDefaults = allDefaults;
    }

    const locals = chosenType === "truth" ? customTruths : customDares;
    const rooms = roomCustomPrompts.filter((c: any) => c.type === chosenType);

    const pool = [
      ...filteredDefaults.map((t: any) => t.text),
      ...locals.filter((c: any) => c.type === chosenType).map((c: any) => c.text),
      ...rooms.map((c: any) => c.text),
    ];

    set({
      challengeType: chosenType,
      currentPrompt: pickRandom(pool),
      phase: "revealed",
      lastChallengeType: chosenType,
      timerSeconds: chosenType === "dare" && timerEnabled ? dareTimeLimit : 0,
    });

    if (chosenType === "truth") {
      get().resetTimer();
    }

    void broadcastState(get());
  },

  pickTruth: () => get().pickChallenge("truth"),
  pickDare: () => get().pickChallenge("dare"),

  completeChallenge: () => {
    const ct = get().challengeType;
    set((s: GameState) => {
      const isDare = ct === "dare";
      const newStreak = s.stats.currentStreak + 1;
      const newDareStreak = isDare ? (s.stats.daresCompleted + 1) : s.stats.daresCompleted;

      return {
        phase: "idle" as const,
        challengeType: null,
        currentPrompt: null,
        selectedPlayerId: null,
        timerSeconds: 0,
        dareCamActive: false,
        stats: {
          ...s.stats,
          truthsAnswered: s.stats.truthsAnswered + (ct === "truth" ? 1 : 0),
          daresCompleted: newDareStreak,
          currentStreak: newStreak,
          longestStreak: Math.max(s.stats.longestStreak, newStreak),
        },
        players: s.players.map((p: Player) =>
          p.id === s.selectedPlayerId
            ? { ...p, score: p.score + (ct === "truth" ? 10 : 20) }
            : p
        ),
      };
    });
    void broadcastState(get());
  },

  refuseChallenge: () => {
    set((s: GameState) => ({
      phase: "punishment" as const,
      punishmentText: pickRandom(DEFAULT_PUNISHMENTS),
      dareCamActive: false,
      stats: {
        ...s.stats,
        daresRefused: s.stats.daresRefused + 1,
        currentStreak: 0,
      },
    }));
    void broadcastState(get());
  },

  setPunishment: (text: string) => {
    set({ punishmentText: text });
    void broadcastState(get());
  },

  randomPunishment: () => {
    set({ punishmentText: pickRandom(DEFAULT_PUNISHMENTS) });
    void broadcastState(get());
  },

  confirmPunishmentDone: () => {
    set((s: GameState) => ({
      phase: "idle" as const,
      punishmentText: null,
      challengeType: null,
      currentPrompt: null,
      selectedPlayerId: null,
      stats: {
        ...s.stats,
        punishmentsReceived: s.stats.punishmentsReceived + 1,
      },
    }));
    void broadcastState(get());
  },

  addCustomPrompt: (p: any) => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    if (p.type === "truth") {
      set((s: GameState) => ({ customTruths: [...s.customTruths, { ...p, id }] }));
    } else {
      set((s: GameState) => ({ customDares: [...s.customDares, { ...p, id }] }));
    }
  },

  removeCustomPrompt: (id: string, type: "truth" | "dare") => {
    if (type === "truth") {
      set((s: GameState) => ({ customTruths: s.customTruths.filter((c: CustomPrompt) => c.id !== id) }));
    } else {
      set((s: GameState) => ({ customDares: s.customDares.filter((c: CustomPrompt) => c.id !== id) }));
    }
  },

  setTimerEnabled: (v: boolean) => set({ timerEnabled: v }),
  setDareTimeLimit: (s: number) => set({ dareTimeLimit: s }),
  setAvatarEmoji: (emoji: string) => set({ avatarEmoji: emoji }),
  setAvatarColor: (color: string) => set({ avatarColor: color }),
  setDareCamActive: (active: boolean) => set({ dareCamActive: active }),

  tickTimer: () =>
    set((s: GameState) => {
      const isCounting = (s.phase === "revealed" && s.challengeType === "dare") || s.phase === "choose";
      if (!isCounting || s.timerSeconds <= 0)
        return s;

      const nextSec = s.timerSeconds - 1;

      if (nextSec === 0 && s.phase === "choose") {
        setTimeout(() => get().pickChallenge("random"), 0);
      }

      return { timerSeconds: nextSec };
    }),

  resetTimer: () =>
    set((s: GameState) => ({
      timerSeconds: s.timerEnabled ? s.dareTimeLimit : 0,
    })),

  setChatUnread: (v: boolean) => set({ chatUnread: v }),
  syncFromRemote: (remoteState: Partial<GameState>) => {
    const current = get();
    const updates: Partial<GameState> = {};

    if (remoteState.phase !== undefined && remoteState.phase !== current.phase) {
      updates.phase = remoteState.phase as GamePhase;
    }
    if (remoteState.bottleRotation !== undefined && remoteState.bottleRotation !== current.bottleRotation) {
      updates.bottleRotation = remoteState.bottleRotation;
    }
    if (remoteState.selectedPlayerId !== undefined && remoteState.selectedPlayerId !== current.selectedPlayerId) {
      updates.selectedPlayerId = remoteState.selectedPlayerId;
    }
    if (remoteState.challengeType !== undefined && remoteState.challengeType !== current.challengeType) {
      updates.challengeType = remoteState.challengeType;
    }
    if (remoteState.currentPrompt !== undefined && remoteState.currentPrompt !== current.currentPrompt) {
      updates.currentPrompt = remoteState.currentPrompt;
    }
    if (remoteState.timerSeconds !== undefined && remoteState.timerSeconds !== current.timerSeconds) {
      updates.timerSeconds = remoteState.timerSeconds;
    }
    if (remoteState.punishmentText !== undefined && remoteState.punishmentText !== current.punishmentText) {
      updates.punishmentText = remoteState.punishmentText;
    }
    if (remoteState.dareCamActive !== undefined && remoteState.dareCamActive !== current.dareCamActive) {
      updates.dareCamActive = remoteState.dareCamActive;
    }
    if (remoteState.players !== undefined && JSON.stringify(remoteState.players) !== JSON.stringify(current.players)) {
      updates.players = remoteState.players;
    }
    if (remoteState.gameStarted !== undefined && remoteState.gameStarted !== current.gameStarted) {
      updates.gameStarted = remoteState.gameStarted;
    }
    if (remoteState.votes !== undefined && JSON.stringify(remoteState.votes) !== JSON.stringify(current.votes)) {
      updates.votes = remoteState.votes;
    }

    if (Object.keys(updates).length > 0) {
      set(updates);
    }
  },
}));
