import React from "react";
import { Alert, StyleSheet, View } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import {
  usePushNotifications,
  useWebViewMessageHandler,
  useWebViewShareHandler,
  useUserDebug,
  useInitialUrlFromNotification,
} from "./shared/hooks";
import { WEBVIEW_URL } from "./constants/urls";
import { useSocialLogin } from "./features/social-login";
import {
  useSplashTimer,
  useSplashVisibility,
  useSplashSound,
  SplashScreen,
} from "./features/splash";
import { WebViewContainer } from "./features/webview";

function AppContent() {
  const insets = useSafeAreaInsets();

  // 스플래시 타이머 (3초 최소 시간)
  const { minTimeElapsed } = useSplashTimer();

  // WebView 상태 관리 (로딩 완료 여부)
  const [isWebViewReady, setIsWebViewReady] = React.useState(false);

  // 스플래시 사운드 관리
  const { preload, playOnce, unload } = useSplashSound();

  // 스플래시 표시 여부 및 페이드 애니메이션
  const { showSplash, fadeAnim } = useSplashVisibility({
    minTimeElapsed,
    isWebViewReady,
    onFadeOutEnd: unload,
  });

  // 앱 시작 시 사운드 프리로드 및 재생
  React.useEffect(() => {
    const initializeSound = async () => {
      await preload();

      // 스플래시가 표시되면 즉시 재생
      if (showSplash) {
        await playOnce();
      }
    };

    initializeSound();
  }, [preload, playOnce, showSplash]);

  // WebView ref를 한 번만 선언하고 모든 훅에서 공유
  const webViewRef = React.useRef<WebView | null>(null);

  // 알림으로부터 초기 URL 결정
  const initialUrl = useInitialUrlFromNotification(WEBVIEW_URL);

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
  const handleCombinedMessage = (event: WebViewMessageEvent) => {
    handleSocialLoginMessage(event);
    handleWebViewMessage(event);
    handleShareMessage(event);
  };

  // WebView 로딩 완료 핸들러
  const handleWebViewLoadEnd = () => {
    setIsWebViewReady(true);
  };

  // 로딩 인디케이터 표시 여부 (3초 이상 걸릴 경우)
  const showLoadingIndicator = minTimeElapsed && !isWebViewReady;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* WebView 컨테이너 - 백그라운드에서 프리로딩 */}
      <WebViewContainer
        webViewRef={webViewRef}
        onMessage={handleCombinedMessage}
        showSplash={showSplash}
        onLoadEnd={handleWebViewLoadEnd}
        initialUrl={initialUrl}
      />

      {/* 스플래시 오버레이 */}
      {showSplash && (
        <SplashScreen
          fadeAnim={fadeAnim}
          showLoadingIndicator={showLoadingIndicator}
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
  },
});
