import { useRef } from "react";
import { Audio } from "expo-av";
import { Platform } from "react-native";

const SPLASH_SOUND_FILE = require("../../../assets/sounds/splash.mp3");

export function useSplashSound() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const isPreloadedRef = useRef(false);
  const hasPlayedRef = useRef(false);

  async function preload() {
    try {
      if (soundRef.current) return;
      if (isPreloadedRef.current) return;

      // 안드로이드에서 오디오 포커스 설정
      if (Platform.OS === "android") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });
      }

      const { sound } = await Audio.Sound.createAsync(SPLASH_SOUND_FILE, {
        volume: 0.7,
        shouldPlay: false,
        isLooping: false,
      });

      soundRef.current = sound;
      isPreloadedRef.current = true;
    } catch (error) {
      console.warn("Failed to preload splash sound:", error);
    }
  }

  async function playOnce() {
    try {
      if (!soundRef.current) return;
      if (hasPlayedRef.current) return;

      // 안드로이드에서 재생 전 오디오 포커스 요청
      if (Platform.OS === "android") {
        try {
          await soundRef.current.setStatusAsync({ shouldPlay: true });
        } catch (focusError) {
          console.warn("Failed to acquire audio focus:", focusError);
          // 오디오 포커스 실패해도 재생 시도
        }
      }

      hasPlayedRef.current = true;
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
      isPreloadedRef.current = false;
      hasPlayedRef.current = false;
    } catch (error) {
      console.warn("Failed to unload splash sound:", error);
    }
  }

  return { preload, playOnce, unload };
}
