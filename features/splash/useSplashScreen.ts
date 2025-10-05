import { useState, useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Set the animation options
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export function useSplashScreen() {
  const [showFakeSplash, setShowFakeSplash] = useState(false);

  useEffect(() => {
    // RN 뷰가 뜨면 네이티브 스플래시 즉시 숨김
    SplashScreen.hideAsync();
  }, []);

  const handleWebViewLoadEnd = () => {
    // 최소 1~2초 후 가짜 스플래시 제거
    setTimeout(() => setShowFakeSplash(false), 1200);
  };

  return {
    showFakeSplash,
    handleWebViewLoadEnd,
  };
}
