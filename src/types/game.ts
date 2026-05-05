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
  updatedAt?: string | number;
};

export type RoomDoc = {
  id?: string;
  roomName: string;
  maxPlayers: number;
  vibe: string | null;
  selectionMode?: "choice" | "random" | "alternating";
  status: RoomStatus;
  createdAt: string | number;
  createdByUid: string;
  gameState?: GameStateSync;
  customPrompts?: any[];
};

export type ChatMessage = {
  id: string;
  uid: string;
  name: string;
  text: string;
  createdAt?: string | number;
  created_at?: string | number;
};

export type PlayerDoc = {
  uid: string;
  name: string;
  avatarEmoji: string;
  avatarColor: string;
  isHost: boolean;
  ready: boolean;
  score?: number;
  joinedAt: string | number;
  lastSeenAt: string | number;
};
