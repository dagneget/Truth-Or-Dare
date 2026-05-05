import { supabase } from "./client";
import type { CustomPrompt } from "@/store/useGameStore";
import type { GameStateSync, PlayerDoc, ChatMessage, RoomDoc } from "@/types/game";

// Note: Reusing types from rooms.ts for parity during migration
// We will eventually rename/move these types.

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
}) {
  const { roomCode, roomName, maxPlayers, vibe, selectionMode, hostUid, hostName, hostAvatarEmoji, hostAvatarColor } = params;

  // 1. Create Room
  const { error: roomError } = await supabase.from("rooms").insert({
    code: roomCode,
    room_name: roomName,
    max_players: maxPlayers,
    vibe,
    selection_mode: selectionMode,
    status: "lobby",
    created_by_uid: hostUid,
  });

  if (roomError) throw roomError;

  // 2. Add Host as Player
  const { error: playerError } = await supabase.from("players").upsert({
    uid: hostUid,
    room_code: roomCode,
    name: hostName,
    avatar_emoji: hostAvatarEmoji,
    avatar_color: hostAvatarColor,
    is_host: true,
    ready: false,
    score: 0,
    last_seen_at: new Date().toISOString(),
  });

  if (playerError) throw playerError;
}

export async function joinRoom(params: {
  roomCode: string;
  uid: string;
  name: string;
  avatarEmoji: string;
  avatarColor: string;
}) {
  const { roomCode, uid, name, avatarEmoji, avatarColor } = params;

  // Check if room exists and is in lobby
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("status, max_players")
    .eq("code", roomCode)
    .single();

  if (roomError || !room) throw new Error("Room not found");
  if (room.status !== "lobby") throw new Error("Game already started");

  // Capacity check
  const { count, error: countError } = await supabase
    .from("players")
    .select("*", { count: "exact", head: true })
    .eq("room_code", roomCode);

  if (countError) throw countError;
  if (count !== null && count >= room.max_players) throw new Error("Room is full");

  // Join or Update
  const { error: joinError } = await supabase.from("players").upsert({
    uid,
    room_code: roomCode,
    name,
    avatar_emoji: avatarEmoji,
    avatar_color: avatarColor,
    last_seen_at: new Date().toISOString(),
  });

  if (joinError) throw joinError;
}

export async function setReady(roomCode: string, uid: string, ready: boolean) {
  await supabase
    .from("players")
    .update({ ready, last_seen_at: new Date().toISOString() })
    .eq("uid", uid)
    .eq("room_code", roomCode);
}

export async function startGame(roomCode: string) {
  await supabase
    .from("rooms")
    .update({ status: "playing" })
    .eq("code", roomCode);
}

export async function leaveRoom(roomCode: string, uid: string) {
  await supabase.from("players").delete().eq("uid", uid).eq("room_code", roomCode);
}

export function subscribeRoom(roomCode: string, cb: (room: any) => void) {
  if (!supabase || !roomCode) return () => {};
  const channel = supabase.channel(`room:${roomCode}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "rooms", filter: `code=eq.${roomCode}` },
      (payload) => {
        console.log("Room Change Received:", payload);
        const data = payload.new as any;
        if (!data) return cb(null);
        cb({
          ...data,
          id: data.code,
          roomName: data.room_name || data.roomName,
          maxPlayers: data.max_players || data.maxPlayers,
          selectionMode: data.selection_mode || data.selectionMode,
          customPrompts: data.custom_prompts || data.customPrompts || [],
          gameState: data.game_state || data.gameState,
        });
      }
    )
    .subscribe((status) => {
      console.log(`Room Subscription Status (${roomCode}):`, status);
    });

  // Initial fetch
  supabase
    .from("rooms")
    .select("*")
    .eq("code", roomCode)
    .single()
    .then(({ data }) => {
      if (data) {
        cb({
          ...data,
          id: data.code,
          roomName: data.room_name || data.roomName,
          maxPlayers: data.max_players || data.maxPlayers,
          selectionMode: data.selection_mode || data.selectionMode,
          customPrompts: data.custom_prompts || data.customPrompts || [],
          gameState: data.game_state || data.gameState,
        });
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribePlayers(roomCode: string, cb: (players: any[]) => void) {
  if (!supabase || !roomCode) return () => {};
  const channel = supabase.channel(`players:${roomCode}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "players", filter: `room_code=eq.${roomCode}` },
      async () => {
        console.log("Players Change Detected, fetching fresh list...");
        const { data } = await supabase
          .from("players")
          .select("*")
          .eq("room_code", roomCode)
          .order("joined_at", { ascending: true });
        if (data) {
          cb(data.map(p => ({
            ...p,
            id: p.uid,
            avatarEmoji: p.avatar_emoji || p.avatarEmoji,
            avatarColor: p.avatar_color || p.avatarColor,
            isHost: p.is_host ?? p.isHost,
            score: p.score || 0,
          })));
        }
      }
    )
    .subscribe();

  // Initial fetch
  supabase
    .from("players")
    .select("*")
    .eq("room_code", roomCode)
    .order("joined_at", { ascending: true })
    .then(({ data }) => {
      if (data) {
        cb(data.map(p => ({
          ...p,
          id: p.uid,
          avatarEmoji: p.avatar_emoji || p.avatarEmoji,
          avatarColor: p.avatar_color || p.avatarColor,
          isHost: p.is_host ?? p.isHost,
          score: p.score || 0,
        })));
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function updateGameState(roomCode: string, state: any) {
  // We use Broadcast for high-frequency updates, but persist for "truth/dare" reveal
  // Remove players from state to ensure the players table is the single source of truth
  const { players, ...persistentState } = state;

  const { error } = await supabase
    .from("rooms")
    .update({ game_state: persistentState })
    .eq("code", roomCode);
  
  if (error) console.error("Update state error:", error);
}

export async function sendMessage(roomCode: string, uid: string, name: string, text: string) {
  // 1. Persist to DB
  const { error } = await supabase.from("chat").insert({
    room_code: roomCode,
    uid,
    name,
    text,
  });

  if (error) console.error("Message error:", error);

  // 2. Broadcast for instant UI update
  const channel = supabase.channel(`game:${roomCode}`);
  channel.send({
    type: "broadcast",
    event: "chat_message",
    payload: { 
      id: Math.random().toString(), 
      uid, 
      name, 
      text, 
      created_at: new Date().toISOString() 
    },
  });
}

export function subscribeChat(roomCode: string, cb: (messages: any[]) => void) {
  if (!supabase || !roomCode) return () => {};
  
  let currentMessages: any[] = [];
  
  const updateMessages = (newMessages: any[]) => {
    const map = new Map();
    currentMessages.forEach(m => map.set(m.id || (m.uid + m.created_at), m));
    newMessages.forEach(m => map.set(m.id || (m.uid + m.created_at), m));
    
    currentMessages = Array.from(map.values())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 50);
      
    cb(currentMessages);
  };

  const channel = supabase.channel(`chat:${roomCode}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "chat", filter: `room_code=eq.${roomCode}` },
      async () => {
        const { data } = await supabase
          .from("chat")
          .select("*")
          .eq("room_code", roomCode)
          .order("created_at", { ascending: false })
          .limit(50);
        if (data) updateMessages(data);
      }
    )
    .on("broadcast", { event: "chat_message" }, ({ payload }) => {
      updateMessages([payload]);
    })
    .subscribe();

  // Initial fetch
  supabase
    .from("chat")
    .select("*")
    .eq("room_code", roomCode)
    .order("created_at", { ascending: false })
    .limit(50)
    .then(({ data }) => {
      if (data) updateMessages(data);
    });

  return () => {
    channel.unsubscribe();
  };
}

// REALTIME BROADCAST (For reactions and ephemeral state)
export function subscribeBroadcast(roomCode: string, onReaction: (r: any) => void, onState: (s: any) => void) {
  if (!supabase || !roomCode) return { unsubscribe: () => {} };
  const channel = supabase.channel(`game:${roomCode}`);
  
  channel
    .on("broadcast", { event: "reaction" }, ({ payload }) => {
      console.log("Broadcast Reaction Received:", payload);
      onReaction(payload);
    })
    .on("broadcast", { event: "state_update" }, ({ payload }) => {
      console.log("Broadcast State Received:", payload);
      onState(payload);
    })
    .subscribe((status) => {
      console.log(`Broadcast Subscription Status (${roomCode}):`, status);
    });

  return channel;
}

export function sendBroadcastReaction(channel: any, reaction: any) {
  channel.send({
    type: "broadcast",
    event: "reaction",
    payload: reaction,
  });
}

export function sendStateBroadcast(channel: any, state: any) {
  channel.send({
    type: "broadcast",
    event: "state_update",
    payload: state,
  });
}

export async function addCustomPromptToRoom(
  roomCode: string,
  prompt: CustomPrompt
): Promise<void> {
  const { data, error: fetchError } = await supabase
    .from("rooms")
    .select("custom_prompts")
    .eq("code", roomCode)
    .single();

  if (fetchError) throw fetchError;

  const existing = Array.isArray(data.custom_prompts) ? data.custom_prompts : [];
  const updated = [...existing, prompt];

  const { error: updateError } = await supabase
    .from("rooms")
    .update({ custom_prompts: updated })
    .eq("code", roomCode);

  if (updateError) throw updateError;
}
