import { WebView } from "react-native-webview";
import Constants from "expo-constants";
import { StyleSheet, View, ImageBackground } from "react-native";
import { WEBVIEW_URL } from "./constants/urls";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useWebViewBackHandler } from "./shared/hooks";
import { useSplashScreen } from "./features/splash/useSplashScreen";

function AppContent() {
  const insets = useSafeAreaInsets();
  const { showFakeSplash, handleWebViewLoadEnd } = useSplashScreen();

  // 안드로이드 백버튼 핸들링
  const { webViewRef, handleNavigationStateChange } = useWebViewBackHandler();

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
          // Pull-to-Refresh 설정
          pullToRefreshEnabled={true}
          bounces={true}
          scrollEnabled={true}
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
