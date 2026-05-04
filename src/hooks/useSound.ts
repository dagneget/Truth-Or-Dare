"use client";

import { useEffect, useRef } from "react";
import { Howl } from "howler";

const SOUNDS = {
  spin: "https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3",
  success: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3",
  error: "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3",
  click: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
};

export function useSound() {
  const sounds = useRef<Record<keyof typeof SOUNDS, Howl | null>>({
    spin: null,
    success: null,
    error: null,
    click: null,
  });

  useEffect(() => {
    // Initialize sounds on client side
    Object.entries(SOUNDS).forEach(([key, url]) => {
      sounds.current[key as keyof typeof SOUNDS] = new Howl({
        src: [url],
        volume: 0.5,
      });
    });

    return () => {
      // Clean up
      Object.values(sounds.current).forEach((howl) => howl?.unload());
    };
  }, []);

  const play = (key: keyof typeof SOUNDS) => {
    sounds.current[key]?.play();
  };

  const stop = (key: keyof typeof SOUNDS) => {
    sounds.current[key]?.stop();
  };

  return { play, stop };
}
