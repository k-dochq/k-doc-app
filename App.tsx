import { WebView } from "react-native-webview";
import Constants from "expo-constants";
import { StyleSheet, View, ImageBackground } from "react-native";
import { useRef } from "react";
import { WEBVIEW_URL } from "./constants/urls";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  useWebViewBackHandler,
  usePushNotifications,
  useWebViewMessageHandler,
  useWebViewShareHandler,
  useUserDebug,
  useWebViewLoadEnd,
  useInitialUrlFromNotification,
} from "./shared/hooks";
import { useSplashScreen } from "./features/splash/useSplashScreen";
import { handleShouldStartLoadWithRequest } from "./shared/lib";
import { useSocialLogin } from "./features/social-login";

function AppContent() {
  const insets = useSafeAreaInsets();
  const { showFakeSplash, getSplashScreenAction } = useSplashScreen();

  // WebView ref를 한 번만 선언하고 모든 훅에서 공유
  const webViewRef = useRef<WebView | null>(null);

  // 알림으로부터 초기 URL 결정
  const initialUrl = useInitialUrlFromNotification(WEBVIEW_URL);

  // 안드로이드 백버튼 핸들링
  const { handleNavigationStateChange } = useWebViewBackHandler(webViewRef);

  // 푸시 알림 기능 (토큰 가져오기 및 서버 등록)
  usePushNotifications(webViewRef);

  // 소셜로그인 기능
  const { handleWebViewMessage: handleSocialLoginMessage } =
    useSocialLogin(webViewRef);

  // 웹뷰 메시지 핸들러 (로그인 성공 등)
  const { handleWebViewMessage } = useWebViewMessageHandler(webViewRef);

  // 웹뷰 공유 핸들러
  const { handleWebViewMessage: handleShareMessage } =
    useWebViewShareHandler(webViewRef);

  // 통합 메시지 핸들러
  const handleCombinedMessage = (event: any) => {
    handleSocialLoginMessage(event);
    handleWebViewMessage(event);
    handleShareMessage(event);
  };

  // WebView 로드 완료 시 처리 로직
  const { handleWebViewLoadEnd: handleWebViewLoadEndWithActions } =
    useWebViewLoadEnd({
      webViewRef,
      actions: [getSplashScreenAction()],
    });

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
          source={{ uri: initialUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadEnd={handleWebViewLoadEndWithActions}
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
          onMessage={handleCombinedMessage}
          allowsBackForwardNavigationGestures={true}
          // Pull-to-Refresh 설정
          pullToRefreshEnabled={true}
          bounces={true}
          scrollEnabled={true}
          // 웹뷰 메시지 통신을 위한 설정
          javaScriptEnabled={true}
          domStorageEnabled={true}
          sharedCookiesEnabled={true}
          thirdPartyCookiesEnabled={true}
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
