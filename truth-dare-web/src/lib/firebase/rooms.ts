"use client";

import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Firestore,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb, isFirebaseConfigured } from "./client";
import type { CustomPrompt } from "@/store/useGameStore";

export type RoomStatus = "lobby" | "playing";

export type GameStateSync = {
  phase: string;
  bottleRotation: number;
  selectedPlayerId: string | null;
  challengeType: "truth" | "dare" | null;
  currentPrompt: string | null;
  timerSeconds: number;
  punishmentText: string | null;
  dareCamActive: boolean;
  votes?: Record<string, "pass" | "fail">;
  reactions?: { id: string; emoji: string; senderId: string; timestamp: number }[];
  players?: any[];
  lastUpdateBy: string;
  updatedAt: unknown;
};

export type RoomDoc = {
  roomName: string;
  maxPlayers: number;
  vibe: string | null;
  selectionMode?: "choice" | "random" | "alternating";
  status: RoomStatus;
  createdAt: unknown;
  createdByUid: string;
  gameState?: GameStateSync;
  customPrompts?: CustomPrompt[];
};


export type ChatMessage = {
  id: string;
  uid: string;
  name: string;
  text: string;
  createdAt: unknown;
};

export type PlayerDoc = {
  uid: string;
  name: string;
  avatarEmoji: string;
  avatarColor: string;
  isHost: boolean;
  ready: boolean;
  score?: number;
  joinedAt: unknown;
  lastSeenAt: unknown;
};

function requireDb(): Firestore {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* to .env.local.");
  }
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* to .env.local.");
  return db;
}

function roomRef(db: Firestore, roomCode: string) {
  return doc(db, "rooms", roomCode);
}

function playerRef(db: Firestore, roomCode: string, uid: string) {
  return doc(db, "rooms", roomCode, "players", uid);
}

export async function createRoom(params: {
  roomCode: string;
  roomName: string;
  maxPlayers: number;
  vibe: string | null;
  selectionMode: "choice" | "random" | "alternating";
  hostUid: string;
  hostName: string;
  hostAvatarEmoji: string;
  hostAvatarColor: string;
}): Promise<void> {
  const db = requireDb();
  const { roomCode, roomName, maxPlayers, vibe, selectionMode, hostUid, hostName, hostAvatarEmoji, hostAvatarColor } = params;

  await runTransaction(db, async (tx) => {
    const rRef = roomRef(db, roomCode);
    const snap = await tx.get(rRef);
    if (snap.exists()) throw new Error("Room code already exists. Try again.");

    const room: RoomDoc = {
      roomName: roomName || "Party Room",
      maxPlayers,
      vibe,
      selectionMode,
      status: "lobby",
      createdAt: serverTimestamp(),
      createdByUid: hostUid,
      customPrompts: [],
    };
    tx.set(rRef, room);

    const player: PlayerDoc = {
      uid: hostUid,
      name: hostName || "Player",
      avatarEmoji: hostAvatarEmoji,
      avatarColor: hostAvatarColor,
      isHost: true,
      ready: false,
      score: 0,
      joinedAt: serverTimestamp(),
      lastSeenAt: serverTimestamp(),
    };
    tx.set(playerRef(db, roomCode, hostUid), player);
  });
}

export async function joinRoom(params: {
  roomCode: string;
  uid: string;
  name: string;
  avatarEmoji: string;
  avatarColor: string;
}): Promise<void> {
  const db = requireDb();
  const { roomCode, uid, name, avatarEmoji, avatarColor } = params;

  await runTransaction(db, async (tx) => {
    const rRef = roomRef(db, roomCode);
    const roomSnap = await tx.get(rRef);
    if (!roomSnap.exists()) throw new Error("Room not found.");

    const room = roomSnap.data() as RoomDoc;
    if (room.status !== "lobby") throw new Error("Game already started.");

    // Capacity check based on current player docs.
    const playersSnap = await getDocs(query(collection(db, "rooms", roomCode, "players")));
    if (playersSnap.size >= room.maxPlayers) throw new Error("Room is full.");

    const pRef = playerRef(db, roomCode, uid);
    const pSnap = await tx.get(pRef);
    if (!pSnap.exists()) {
      const player: PlayerDoc = {
        uid,
        name: name || "Player",
        avatarEmoji,
        avatarColor,
        isHost: false,
        ready: false,
        score: 0,
        joinedAt: serverTimestamp(),
        lastSeenAt: serverTimestamp(),
      };
      tx.set(pRef, player);
    } else {
      tx.update(pRef, { name: name || "Player", lastSeenAt: serverTimestamp() });
    }
  });
}

export async function setReady(params: {
  roomCode: string;
  uid: string;
  ready: boolean;
}): Promise<void> {
  const db = requireDb();
  const { roomCode, uid, ready } = params;
  await updateDoc(playerRef(db, roomCode, uid), { ready, lastSeenAt: serverTimestamp() });
}

export async function startGame(params: { roomCode: string }): Promise<void> {
  const db = requireDb();
  await updateDoc(roomRef(db, params.roomCode), { status: "playing" });
}

export async function leaveRoom(params: { roomCode: string; uid: string }): Promise<void> {
  const db = requireDb();
  await deleteDoc(playerRef(db, params.roomCode, params.uid));
}

export function subscribeRoom(
  roomCode: string,
  cb: (room: (RoomDoc & { id: string }) | null) => void
): Unsubscribe {
  const db = requireDb();
  return onSnapshot(
    roomRef(db, roomCode),
    (snap) => {
      cb(snap.exists() ? ({ id: snap.id, ...(snap.data() as RoomDoc) } as const) : null);
    },
    () => cb(null)
  );
}

export function subscribePlayers(
  roomCode: string,
  cb: (players: PlayerDoc[]) => void
): Unsubscribe {
  const db = requireDb();
  const q = query(collection(db, "rooms", roomCode, "players"), orderBy("joinedAt", "asc"));
  return onSnapshot(
    q,
    (snap) => {
      cb(snap.docs.map((d) => d.data() as PlayerDoc));
    },
    () => cb([])
  );
}

export async function updateGameState(params: {
  roomCode: string;
  state: Omit<GameStateSync, "updatedAt">;
}): Promise<void> {
  const db = requireDb();
  await updateDoc(roomRef(db, params.roomCode), {
    gameState: {
      ...params.state,
      updatedAt: serverTimestamp(),
    },
  });
}

export async function sendMessage(params: {
  roomCode: string;
  uid: string;
  name: string;
  text: string;
}): Promise<void> {
  const db = requireDb();
  await addDoc(collection(db, "rooms", params.roomCode, "chat"), {
    uid: params.uid,
    name: params.name,
    text: params.text,
    createdAt: serverTimestamp(),
  });
}

export function subscribeChat(
  roomCode: string,
  cb: (messages: ChatMessage[]) => void
): Unsubscribe {
  const db = requireDb();
  const q = query(
    collection(db, "rooms", roomCode, "chat"),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  return onSnapshot(
    q,
    (snap) => {
      cb(
        snap.docs.map(
          (d) =>
            ({
              id: d.id,
              ...d.data(),
            } as ChatMessage)
        )
      );
    },
    () => cb([])
  );
}

export async function addCustomPromptToRoom(
  roomCode: string,
  prompt: CustomPrompt
): Promise<void> {
  const db = requireDb();
  await updateDoc(roomRef(db, roomCode), {
    customPrompts: arrayUnion(prompt),
  });
}
