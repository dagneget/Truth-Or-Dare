"use client";

import useSound from "use-sound";
import { useCallback } from "react";

export function useGameSounds() {
  // Using open-source UI sound placeholders
  const [playSpin] = useSound("https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3", { volume: 0.5 });
  const [playSuccess] = useSound("https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3", { volume: 0.6 });
  const [playError] = useSound("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3", { volume: 0.4 });
  const [playClick] = useSound("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3", { volume: 0.3 });
  const [playDing] = useSound("https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3", { volume: 0.5 });

  const play = useCallback((type: "spin" | "success" | "error" | "click" | "ding") => {
    switch (type) {
      case "spin": playSpin(); break;
      case "success": playSuccess(); break;
      case "error": playError(); break;
      case "click": playClick(); break;
      case "ding": playDing(); break;
    }
  }, [playSpin, playSuccess, playError, playClick, playDing]);

  return { play };
}
