"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Flame, Zap, ChevronRight, Shuffle, CircleCheck, AlertTriangle } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import { BottleSpinner } from "@/components/game/BottleSpinner";
import { PlayerOrbit } from "@/components/game/PlayerOrbit";
import { TimerRing } from "@/components/game/TimerRing";
import { DEFAULT_PUNISHMENTS } from "@/data/defaultPrompts";
import { subscribeRoom, subscribePlayers, subscribeBroadcast } from "@/lib/supabase/rooms";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { useGameSounds } from "@/hooks/useGameSounds";
import confetti from "canvas-confetti";

import { LiveCam } from "@/components/game/LiveCam";
import { GameChat } from "@/components/game/GameChat";
import { sendMessage } from "@/lib/supabase/rooms";
import { cn } from "@/lib/utils";
import { FloatingReactions, ReactionPicker } from "@/components/game/FloatingReactions";
import { Leaderboard } from "@/components/game/Leaderboard";
import { Trophy } from "lucide-react";

export default function PlayPage() {
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const { play } = useGameSounds();
  const roomCode = useGameStore((s) => s.roomCode);

  const selfId = useGameStore((s) => s.selfId);
  const syncFromRemote = useGameStore((s) => s.syncFromRemote);
  const setPlayers = useGameStore((s) => s.setPlayers);
  const setBroadcastChannel = useGameStore((s) => s.setBroadcastChannel);
  const receiveReaction = useGameStore((s) => s.receiveReaction);
  const gameStarted = useGameStore((s) => s.gameStarted);

  const phase = useGameStore((s) => s.phase);
  const spinBottle = useGameStore((s) => s.spinBottle);
  const pickChallenge = useGameStore((s) => s.pickChallenge as (type?: "truth" | "dare" | "random" | "alternating", customText?: string) => void);
  const completeChallenge = useGameStore((s) => s.completeChallenge);
  const refuseChallenge = useGameStore((s) => s.refuseChallenge);
  const currentPrompt = useGameStore((s) => s.currentPrompt);
  const challengeType = useGameStore((s) => s.challengeType);
  const selectedPlayerId = useGameStore((s) => s.selectedPlayerId);
  const selectionMode = useGameStore((s) => s.selectionMode);
  const timerSeconds = useGameStore((s) => s.timerSeconds);
  const dareTimeLimit = useGameStore((s) => s.dareTimeLimit);
  const timerEnabled = useGameStore((s) => s.timerEnabled);
  const punishmentText = useGameStore((s) => s.punishmentText);
  const setPunishment = useGameStore((s) => s.setPunishment);
  const randomPunishment = useGameStore((s) => s.randomPunishment);
  const confirmPunishmentDone = useGameStore((s) => s.confirmPunishmentDone);
  const tickTimer = useGameStore((s) => s.tickTimer);
  const players = useGameStore((s) => s.players);
  const dareCamActive = useGameStore((s) => s.dareCamActive);
  const setDareCamActive = useGameStore((s) => s.setDareCamActive);
  const votes = useGameStore((s) => s.votes);
  const setVote = useGameStore((s) => s.setVote);
  const startVoting = useGameStore((s) => s.startVoting);
  const resolveVoting = useGameStore((s) => s.resolveVoting);

  const [truthAnswer, setTruthAnswer] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [customPromptType, setCustomPromptType] = useState<"truth" | "dare">("truth");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customPunishment, setCustomPunishment] = useState("");
  const currentTurnIndex = useGameStore((s) => s.currentTurnIndex);
  const pendingAnswer = useGameStore((s) => s.pendingAnswer);
  const submittedAnswers = useGameStore((s) => s.submittedAnswers);
  const submitAnswer = useGameStore((s) => s.submitAnswer);
  const nextTurn = useGameStore((s) => s.nextTurn);

  useEffect(() => {
    if (!isSupabaseConfigured || !roomCode) return;

    const unsubRoom = subscribeRoom(roomCode, (room) => {
      if (!room || !room.game_state) return;
      
      const remote = room.game_state;
      const current = useGameStore.getState();

      // Trigger sounds for remote changes
      if (remote.phase === "spinning" && current.phase !== "spinning") play("spin");
      if (remote.phase === "revealed" && current.phase !== "revealed") play("click");
      if (remote.phase === "punishment" && current.phase !== "punishment") play("error");
      if (remote.phase === "voting" && current.phase !== "voting") play("ding");

      // Removed selfId check to allow state to catch up regardless of origin
      syncFromRemote(remote);
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
      (payload) => {
        // High frequency reaction handling
        if (payload.emoji) {
          receiveReaction(payload);
        }
      },
      (state) => {
        // High frequency state updates
        syncFromRemote(state);
      }
    );
    
    setBroadcastChannel(unsubBroadcast);

    return () => {
      unsubRoom();
      unsubPlayers();
      unsubBroadcast.unsubscribe();
      setBroadcastChannel(null);
    };
  }, [roomCode, selfId, syncFromRemote, play, setPlayers, setBroadcastChannel]);

  useEffect(() => {
    if (phase !== "revealed" || challengeType !== "dare" || !timerEnabled || timerSeconds <= 0)
      return;
    const id = window.setInterval(() => tickTimer(), 1000);
    return () => window.clearInterval(id);
  }, [phase, challengeType, timerEnabled, timerSeconds, tickTimer]);

  if (!gameStarted) {
    return (
      <div className="py-16 text-center">
        <p className="text-[var(--muted)]">Game has not started.</p>
        <Link href="/lobby" className="mt-4 inline-block text-[var(--neon-cyan)] underline">
          Back to lobby
        </Link>
      </div>
    );
  }

  const selectedName = players.find((p) => p.id === selectedPlayerId)?.name;
  const me = players.find((p) => p.id === selfId);
  const isMyTurn = selectedPlayerId === selfId;
  const isCurrentTurn = players[currentTurnIndex]?.id === selfId;
  const canSpin = phase === "idle" && gameStarted && isCurrentTurn;
  const isHost = me?.isHost ?? false;
  const canSelectChallenge = isMyTurn; // ONLY the active player can choose Truth or Dare
  const canAct = isMyTurn || isHost; // Host or active player can spin/complete

  const showTruthDare = phase === "choose" && Boolean(selectedPlayerId);
  const showPrompt = (phase === "revealed" || phase === "voting") && currentPrompt;
  const isPunishment = phase === "punishment";

  const displayTimer =
    phase === "revealed" && challengeType === "dare" && timerEnabled
      ? timerSeconds
      : dareTimeLimit;

  const handleTruthAnswer = async () => {
    if (!truthAnswer.trim() || !roomCode || !me) return;
    
    const ans = truthAnswer;
    setTruthAnswer("");
    
    play("success");
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#00fbfb", "#c265ff", "#ffffff"],
    });
    
    submitAnswer(ans);
    
    startVoting();
    
    await sendMessage(roomCode, selfId, me.name, `📢 ANSWERED "${currentPrompt}": ${ans}`);
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden pb-8 pt-2">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10 ambient-lights" />
      <div className="absolute inset-0 -z-10 perspective-grid opacity-30" />
      
      <GameChat />
      
      {/* Neon Header */}
      <div className="mb-6 flex flex-col items-center relative">
        <button
          onClick={() => setIsLeaderboardOpen(true)}
          className="absolute left-0 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[var(--neon-pink-bright)] shadow-[0_0_15px_rgba(255,65,175,0.2)]"
        >
          <Trophy className="h-5 w-5" />
        </button>
        
        <h1 className="text-center font-[family-name:var(--font-space-grotesk)] text-2xl font-black uppercase tracking-[0.25em] text-white text-glow-cyan sm:text-3xl">
          Spin The Bottle
        </h1>
        <div className="mt-1 flex items-center gap-3">
          <div className="h-[2px] w-8 bg-gradient-to-r from-transparent to-[var(--neon-pink)]" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--neon-pink)]">
            Truth <span className="mx-1 text-white/40 text-xs italic font-normal">or</span> Dare
          </p>
          <div className="h-[2px] w-8 bg-gradient-to-l from-transparent to-[var(--neon-pink)]" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <TimerRing seconds={displayTimer} max={dareTimeLimit} />
        {phase === "choose" && selectedName && (
          <p className="text-center text-sm font-semibold text-[var(--neon-pink-bright)]">
            {selectedName}&apos;s turn
          </p>
        )}
        <PlayerOrbit>
          <BottleSpinner />
        </PlayerOrbit>
      </div>

      {/* Challenge selection - mode-aware */}
      {selectionMode === "choice" ? (
        /* Players Choice mode: show both Truth and Dare buttons + custom option */
        <div className="mt-8 space-y-3">
          {isCurrentTurn ? (
            <button
              type="button"
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="w-full rounded-xl border border-[var(--neon-purple)]/30 bg-[var(--neon-purple)]/10 py-2 text-xs font-bold uppercase tracking-wider text-[var(--neon-purple)]"
            >
              {showCustomInput ? "Use Existing Questions" : "+ Write My Own Question"}
            </button>
          ) : null}

          {showCustomInput && isCurrentTurn ? (
            <div className="space-y-3 rounded-2xl border border-[var(--neon-purple)]/30 bg-[var(--neon-purple)]/5 p-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCustomPromptType("truth")}
                  className={cn(
                    "flex-1 rounded-lg py-2 text-xs font-bold uppercase",
                    customPromptType === "truth" ? "bg-[var(--neon-cyan)] text-black" : "bg-white/10 text-white/50"
                  )}
                >
                  Truth
                </button>
                <button
                  type="button"
                  onClick={() => setCustomPromptType("dare")}
                  className={cn(
                    "flex-1 rounded-lg py-2 text-xs font-bold uppercase",
                    customPromptType === "dare" ? "bg-[var(--neon-pink)] text-white" : "bg-white/10 text-white/50"
                  )}
                >
                  Dare
                </button>
              </div>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder={customPromptType === "truth" ? "Write your custom truth question..." : "Write your custom dare..."}
                className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-sm text-white placeholder:text-white/30"
                rows={2}
              />
              <button
                type="button"
                disabled={!customPrompt.trim()}
                onClick={() => {
                  if (customPrompt.trim()) {
                    pickChallenge(customPromptType, customPrompt);
                    setShowCustomInput(false);
                    setCustomPrompt("");
                  }
                }}
                className="w-full rounded-xl bg-[var(--neon-purple)] py-3 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-40"
              >
                Use This Question
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={!showTruthDare || !canSelectChallenge}
                onClick={() => pickChallenge("truth")}
                className="glass-panel glow-border-cyan flex flex-col items-center gap-2 rounded-2xl py-5 font-[family-name:var(--font-space-grotesk)] text-sm font-bold uppercase tracking-wider text-[var(--neon-cyan)] disabled:opacity-40"
              >
                <Brain className="h-6 w-6" />
                Truth
              </button>
              <button
                type="button"
                disabled={!showTruthDare || !canSelectChallenge}
                onClick={() => pickChallenge("dare")}
                className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br from-[var(--neon-pink)] to-[#b040a8] py-5 font-[family-name:var(--font-space-grotesk)] text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_24px_rgba(255,65,175,0.4)] disabled:opacity-40"
              >
                <Flame className="h-6 w-6" />
                Dare
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Random or Alternating mode: single button */
        <div className="mt-8">
          <button
            type="button"
            disabled={!showTruthDare || !canAct}
            onClick={() => pickChallenge(selectionMode)}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[var(--neon-cyan)] via-[var(--neon-purple)] to-[var(--neon-pink)] py-5 font-[family-name:var(--font-space-grotesk)] text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_28px_rgba(194,101,255,0.4)] disabled:opacity-40"
          >
            <Zap className="h-6 w-6" />
            {selectionMode === "random" ? "Reveal Fate" : "Next Challenge"}
          </button>
        </div>
      )}

      {/* Waiting message for non-active players */}
      {showTruthDare && !canAct && (
        <p className="mt-3 text-center text-xs text-[var(--muted)] animate-pulse">
          Waiting for {selectedName} to choose…
        </p>
      )}

      {phase === "idle" && canSpin && (
        <button
          type="button"
          onClick={() => {
            play("spin");
            spinBottle();
          }}
          className="mt-6 w-full rounded-2xl border border-[var(--neon-purple)]/50 bg-[var(--neon-purple)]/10 py-4 font-[family-name:var(--font-space-grotesk)] text-sm font-bold uppercase tracking-wider text-[var(--neon-purple)]"
        >
          Spin the Bottle
        </button>
      )}

      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed inset-x-4 bottom-24 z-[60] mx-auto max-w-lg rounded-3xl border border-white/10 bg-[#121212] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-3xl"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--neon-cyan)]">
                {challengeType}
              </p>
              
              {challengeType === "dare" && (
                <button
                  type="button"
                  onClick={() => setDareCamActive(!dareCamActive)}
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider transition-all ${
                    dareCamActive 
                      ? "bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]" 
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  <div className={`h-1.5 w-1.5 rounded-full ${dareCamActive ? "bg-white animate-pulse" : "bg-white/40"}`} />
                  {isMyTurn ? (dareCamActive ? "Stop Cam" : "Go Live") : (dareCamActive ? "Watch Live" : "Stream Off")}
                </button>
              )}
            </div>
            
            <p className="mt-4 text-center font-[family-name:var(--font-spline)] text-xl font-bold leading-tight text-white">
              {currentPrompt}
            </p>

            {phase === "revealed" && (
              challengeType === "truth" ? (
                <div className="mt-8 space-y-4">
                  {isMyTurn ? (
                    <>
                      <div className="relative">
                        <textarea
                          rows={3}
                          value={truthAnswer}
                          onChange={(e) => setTruthAnswer(e.target.value)}
                          placeholder="Type your honest answer..."
                          className="w-full rounded-2xl border-2 border-white/5 bg-white/[0.03] p-4 text-sm text-white transition-colors focus:border-[var(--neon-cyan)]/50 focus:outline-none"
                        />
                        <p className="mt-2 text-[10px] text-center text-white/30 italic">
                          Tip: Long stories can continue in the party chat!
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={!truthAnswer.trim()}
                        onClick={handleTruthAnswer}
                        className="w-full rounded-2xl bg-[var(--neon-cyan-dim)] hover:bg-[var(--neon-cyan)] py-4 font-black uppercase tracking-widest text-black shadow-lg transition-all active:scale-95 disabled:opacity-40"
                      >
                        Post Answer
                      </button>
                    </>
                  ) : (
                    <p className="text-center text-sm italic text-[var(--muted)] animate-pulse py-4">
                      Waiting for {selectedName} to answer...
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-8 space-y-4">
                  {isMyTurn ? (
                    <button
                      type="button"
                      onClick={() => setDareCamActive(!dareCamActive)}
                      className={cn(
                        "flex w-full items-center justify-center gap-3 rounded-2xl py-4 font-black uppercase tracking-widest transition-all",
                        dareCamActive 
                          ? "bg-red-500/20 text-red-500 border border-red-500/50" 
                          : "bg-white text-black animate-pulse shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                      )}
                    >
                      <div className={cn("h-3 w-3 rounded-full shadow-[0_0_8px_currentColor]", dareCamActive ? "bg-red-500 animate-pulse" : "bg-red-600")} />
                      {dareCamActive ? "Close Camera" : "Launch Dare Cam"}
                    </button>
                  ) : (
                    dareCamActive && (
                      <div className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500/10 py-3 text-red-500 border border-red-500/20">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Witnessing Live Dare</span>
                      </div>
                    )
                  )}
                  <div className="mt-4 flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={!canAct}
                    onClick={() => {
                      play("success");
                      confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ["#ff41af", "#00fbfb", "#c265ff"],
                      });
                      startVoting();
                    }}
                    className="w-full rounded-2xl bg-[var(--success)] py-4 font-black uppercase tracking-widest text-black shadow-lg transition-all active:scale-95"
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    disabled={!canAct}
                    onClick={() => {
                      play("error");
                      refuseChallenge();
                    }}
                    className="rounded-xl border border-white/20 py-3 text-sm font-semibold text-[var(--muted)] disabled:opacity-40"
                  >
                    I refuse
                  </button>
                  </div>
                </div>
              )
            )}

            {phase === "voting" && (
              <div className="mt-8 space-y-6">
                {/* Show the challenge to the jury */}
                {currentPrompt && (
                  <div className="rounded-xl border border-[var(--neon-pink)]/30 bg-[var(--neon-pink)]/5 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--neon-pink)]">
                      {challengeType === "truth" ? "Truth" : "Dare"} Challenge
                    </div>
                    <p className="mt-2 text-lg font-bold text-white">{currentPrompt}</p>
                  </div>
                )}

                <div className="text-center">
                  <p className="text-sm font-bold uppercase tracking-widest text-white/60">Audience Jury</p>
                  <h3 className="mt-1 text-lg font-black text-white">Did {selectedName} succeed?</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    disabled={isMyTurn}
                    onClick={() => setVote("pass")}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl py-4 transition-all",
                      votes[selfId] === "pass" 
                        ? "bg-[var(--success)] text-black shadow-[0_0_20px_rgba(52,211,153,0.4)]" 
                        : "bg-white/5 text-[var(--success)] hover:bg-white/10"
                    )}
                  >
                    <span className="text-2xl font-bold">{Object.values(votes).filter(v => v === "pass").length}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Pass</span>
                  </button>
                  
                  <button
                    type="button"
                    disabled={isMyTurn}
                    onClick={() => setVote("fail")}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl py-4 transition-all",
                      votes[selfId] === "fail" 
                        ? "bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]" 
                        : "bg-white/5 text-red-500 hover:bg-white/10"
                    )}
                  >
                    <span className="text-2xl font-bold">{Object.values(votes).filter(v => v === "fail").length}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Fail</span>
                  </button>
                </div>

                {isMyTurn && (
                  <div className="mt-6 text-center text-sm text-white/50 italic animate-pulse">
                    Waiting for the jury's verdict...
                  </div>
                )}
                
                {!isMyTurn && (
                  <div className="mt-6 space-y-4">
                    {isHost ? (
                      <button
                        onClick={() => resolveVoting()}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-[var(--neon-pink)] to-[var(--neon-purple)] font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(255,46,144,0.3)]"
                      >
                        Resolve Jury
                      </button>
                    ) : (
                      <div className="mt-6 text-center text-sm text-white/50 italic">
                        Waiting for host to resolve...
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {roomCode && dareCamActive && (
          <LiveCam 
            roomCode={roomCode} 
            playerName={selectedName || "Player"} 
            isStreaming={isMyTurn}
            onClose={() => setDareCamActive(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPunishment && punishmentText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex flex-col bg-gradient-to-b from-[#1a0505] to-[#120a1a] px-5 pb-28 pt-12"
          >
            <div className="flex flex-col items-center text-center">
              <AlertTriangle className="h-12 w-12 text-[#ffb3ab] drop-shadow-[0_0_16px_#ffb3ab]" />
              <h2 className="mt-4 font-[family-name:var(--font-space-grotesk)] text-2xl font-bold uppercase tracking-wide text-[#ffb3ab] text-glow-pink">
                Challenge refused!
              </h2>
              <p className="mt-2 text-sm text-white/80">You backed out. Now you must pay the price.</p>
            </div>

            <div className="mt-8 rounded-2xl border border-[#ffb3ab]/50 bg-black/30 p-6 shadow-[0_0_24px_rgba(255,179,171,0.15)]">
              <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full bg-[#4a0e0e] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                <Flame className="h-3.5 w-3.5" />
                Punishment
              </div>
              <p className="text-center text-lg font-bold leading-snug text-white">{punishmentText}</p>
            </div>

            <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
              Select or write punishment:
            </p>
            
            <textarea
              value={customPunishment}
              onChange={(e) => setCustomPunishment(e.target.value)}
              placeholder="Write your own punishment..."
              className="mt-3 w-full rounded-xl border border-[#ffb3ab]/30 bg-black/50 p-3 text-sm text-white placeholder:text-white/30"
              rows={2}
            />
            
            {customPunishment.trim() && (
              <button
                type="button"
                onClick={() => {
                  setPunishment(customPunishment);
                  setCustomPunishment("");
                }}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ffb3ab] py-3 text-xs font-bold uppercase tracking-wider text-[#2a1010]"
              >
                Use This Punishment
              </button>
            )}
            
            <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
              Or choose from these:
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {DEFAULT_PUNISHMENTS.filter((p) => p !== punishmentText)
                .slice(0, 2)
                .map((p) => (
                  <li key={p}>
                    <button
                      type="button"
                      onClick={() => setPunishment(p)}
                      className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white/90"
                    >
                      {p}
                      <ChevronRight className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                    </button>
                  </li>
                ))}
            </ul>

            <button
              type="button"
              onClick={randomPunishment}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#ffb3ab]/60 py-3.5 font-[family-name:var(--font-space-grotesk)] text-xs font-bold uppercase tracking-wider text-[#ffb3ab]"
            >
              <Shuffle className="h-4 w-4" />
              Generate random punishment
            </button>
            <button
              type="button"
              onClick={confirmPunishmentDone}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ffb3ab] py-4 font-[family-name:var(--font-space-grotesk)] text-sm font-bold uppercase tracking-wider text-[#2a1010]"
            >
              <CircleCheck className="h-5 w-5" />I did it
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed top-20 left-0 right-0 z-[100] px-5 pointer-events-none">
        <div className="mx-auto max-w-lg pointer-events-auto">
          <ReactionPicker />
        </div>
      </div>

      <FloatingReactions />
      <Leaderboard isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />
    </div>
  );
}
