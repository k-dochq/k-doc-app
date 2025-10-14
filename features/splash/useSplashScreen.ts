import { useState, useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Set the animation options
SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

export function useSplashScreen() {
  const [isWebViewLoaded, setIsWebViewLoaded] = useState(false);

  useEffect(() => {
    // WebView 로드 완료 시 스플래시 숨김
    if (isWebViewLoaded) {
      SplashScreen.hide();
    }
  }, [isWebViewLoaded]);

  return {
    isWebViewLoaded,
    setIsWebViewLoaded,
  };
}
