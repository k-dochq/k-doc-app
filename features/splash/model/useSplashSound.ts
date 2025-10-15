import { useRef } from "react";
import { Audio } from "expo-av";

const SPLASH_SOUND_FILE = require("../../../assets/sounds/splash.mp3");

export function useSplashSound() {
  const soundRef = useRef<Audio.Sound | null>(null);

  async function preload() {
    try {
      if (soundRef.current) return;

      const { sound } = await Audio.Sound.createAsync(SPLASH_SOUND_FILE, {
        volume: 0.7,
        shouldPlay: false,
        isLooping: false,
      });

      soundRef.current = sound;
    } catch (error) {
      console.warn("Failed to preload splash sound:", error);
    }
  }

  async function playOnce() {
    try {
      if (!soundRef.current) return;
      await soundRef.current.replayAsync();
    } catch (error) {
      console.warn("Failed to play splash sound:", error);
    }
  }

  async function unload() {
    try {
      if (!soundRef.current) return;
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    } catch (error) {
      console.warn("Failed to unload splash sound:", error);
    }
  }

  return { preload, playOnce, unload };
}
