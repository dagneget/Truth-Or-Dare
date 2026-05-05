"use client";

import { X, Maximize2, Minimize2, Mic, MicOff, Video, VideoOff, PhoneOff, Users } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Room,
  LocalAudioTrack,
  LocalVideoTrack,
} from "livekit-client";

interface DareCamProps {
  roomCode: string;
  onClose: () => void;
  isStreaming: boolean;
  playerName: string;
}

export function LiveCam({ roomCode, onClose, isStreaming, playerName }: DareCamProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [participants, setParticipants] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const roomRef = useRef<Room | null>(null);
  const mountedRef = useRef(true);
  const localTracksRef = useRef<{audio: LocalAudioTrack | null, video: LocalVideoTrack | null}>({
    audio: null,
    video: null,
  });

  const roomName = `truthdare-${roomCode.toLowerCase().replace(/[^a-z0-9]/g, "")}`;

  const connectToRoom = async () => {
    if (!mountedRef.current) return;
    
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch("/api/livekit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName,
          userName: playerName || "Player",
          userId: `player-${Date.now()}`,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get token");
      }

      const { token, serverUrl } = await res.json();

      if (!mountedRef.current) return;

      const room = new Room();
      roomRef.current = room;

      await room.connect(serverUrl, token);

      if (!mountedRef.current) {
        room.disconnect();
        return;
      }

      setIsLoading(false);

      room.on("participantConnected", () => {
        if (mountedRef.current) {
          setParticipants(room.numParticipants + 1);
        }
      });

      room.on("participantDisconnected", () => {
        if (mountedRef.current) {
          setParticipants(Math.max(1, room.numParticipants));
        }
      });

      setParticipants(room.numParticipants + 1);

      room.localParticipant.on("trackPublished", (publication) => {
        if (!publication.track) return;
        if (publication.track.kind === "audio") {
          localTracksRef.current.audio = publication.track as unknown as LocalAudioTrack;
        }
        if (publication.track.kind === "video") {
          localTracksRef.current.video = publication.track as unknown as LocalVideoTrack;
          if (mountedRef.current && videoRef.current) {
            publication.track.attach(videoRef.current);
          }
        }
      });

    } catch (err) {
      console.error("LiveKit connection error:", err);
      if (mountedRef.current) {
        setError("Could not connect to video");
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    connectToRoom();

    return () => {
      mountedRef.current = false;
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
    };
  }, []);

  const toggleMute = () => {
    const track = localTracksRef.current.audio;
    if (track) {
      if (isMuted) {
        track.unmute();
      } else {
        track.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    const track = localTracksRef.current.video;
    if (track) {
      if (isVideoOff) {
        track.unmute();
      } else {
        track.mute();
      }
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleClose = () => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className={`fixed z-[100] overflow-hidden rounded-3xl border-2 border-[var(--neon-pink)]/50 bg-black shadow-[0_0_50px_rgba(255,65,175,0.4)] transition-all duration-300 ${
        isMaximized 
          ? "inset-4 md:inset-10" 
          : "bottom-24 right-4 h-64 w-48 md:h-80 md:w-60"
      }`}
    >
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent p-3">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full shadow-[0_0_8px_red] ${!isVideoOff ? "animate-pulse bg-red-500" : "bg-gray-500"}`} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-white">
            {!isVideoOff ? "LIVE" : `${playerName}'s Stream`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {participants > 1 && (
            <div className="flex items-center gap-1 text-[10px] text-white/70">
              <Users className="h-3 w-3" />
              <span>{participants}</span>
            </div>
          )}
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="rounded-full bg-white/10 p-1.5 text-white/70 hover:bg-white/20"
          >
            {isMaximized ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </button>
          <button
            onClick={handleClose}
            className="rounded-full bg-white/10 p-1.5 text-white/70 hover:bg-white/20"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="h-full w-full bg-black">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
            <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[var(--neon-pink)] border-t-transparent" />
            <span className="text-xs text-white/60">Connecting to video...</span>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
            <span className="text-xs text-red-400">{error}</span>
            <button
              onClick={connectToRoom}
              className="mt-2 rounded-full bg-[var(--neon-pink)] px-3 py-1 text-xs text-white"
            >
              Retry
            </button>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`h-full w-full object-cover ${isVideoOff ? "hidden" : ""}`}
        />

        {isVideoOff && !isLoading && !error && (
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[var(--neon-pink)] to-purple-600 text-3xl font-bold text-white">
              {playerName?.charAt(0).toUpperCase() || "P"}
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/60 px-3 py-2 backdrop-blur-sm">
        <button
          onClick={toggleMute}
          className={`rounded-full p-2 transition-colors ${
            isMuted ? "bg-red-500 text-white" : "bg-white/10 text-white/70 hover:bg-white/20"
          }`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>
        <button
          onClick={toggleVideo}
          className={`rounded-full p-2 transition-colors ${
            isVideoOff ? "bg-red-500 text-white" : "bg-white/10 text-white/70 hover:bg-white/20"
          }`}
          title={isVideoOff ? "Turn on video" : "Turn off video"}
        >
          {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
        </button>
        <button
          onClick={handleClose}
          className="rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
          title="End call"
        >
          <PhoneOff className="h-4 w-4" />
        </button>
      </div>

      {!isMaximized && (
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
      )}
    </motion.div>
  );
}