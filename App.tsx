import { WebView } from "react-native-webview";
import Constants from "expo-constants";
import { StyleSheet, View, ImageBackground } from "react-native";
import { WEBVIEW_URL } from "./constants/urls";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useWebViewBackHandler } from "./shared/hooks";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Set the animation options
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

function AppContent() {
  const insets = useSafeAreaInsets();
  const [showFakeSplash, setShowFakeSplash] = useState(false);

  // 안드로이드 백버튼 핸들링
  const { webViewRef, handleNavigationStateChange } = useWebViewBackHandler();

  useEffect(() => {
    // RN 뷰가 뜨면 네이티브 스플래시 즉시 숨김
    SplashScreen.hideAsync();
  }, []);

  const handleWebViewLoadEnd = () => {
    // 최소 1~2초 후 가짜 스플래시 제거
    setTimeout(() => setShowFakeSplash(false), 1200);
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {showFakeSplash ? (
        <ImageBackground
          source={require("./assets/splash.png")}
          style={styles.splashBackground}
          resizeMode="cover"
        />
      ) : (
        <WebView
          ref={webViewRef}
          style={styles.webview}
          source={{ uri: WEBVIEW_URL }}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadEnd={handleWebViewLoadEnd}
          allowsBackForwardNavigationGestures={true}
        />
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
  webview: {
    flex: 1,
  },
  splashBackground: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});
