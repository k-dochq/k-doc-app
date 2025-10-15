import { useState, useEffect, useRef } from "react";
import { Animated } from "react-native";

interface UseSplashVisibilityProps {
  minTimeElapsed: boolean;
  isWebViewReady: boolean;
  onFadeOutEnd?: () => void;
}

export function useSplashVisibility({
  minTimeElapsed,
  isWebViewReady,
  onFadeOutEnd,
}: UseSplashVisibilityProps) {
  const [showSplash, setShowSplash] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 최소 시간이 지났고 WebView가 준비되면 페이드 아웃
    if (minTimeElapsed && isWebViewReady) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000, // 1초로 늘려서 더 부드럽게
        useNativeDriver: true,
      }).start(() => {
        setShowSplash(false);
        onFadeOutEnd?.();
      });
    }
  }, [minTimeElapsed, isWebViewReady, fadeAnim]);

  return {
    showSplash,
    fadeAnim,
  };
}
