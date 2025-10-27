import React from "react";
import { StyleSheet, View } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import * as Sentry from "@sentry/react-native";
import {
  useAppInitialization,
  useWebViewMessageHandler,
  useWebViewShareHandler,
  useInitialUrlFromNotification,
} from "./shared/hooks";
import { WEBVIEW_URL } from "./constants/urls";
import { useSocialLogin } from "./features/social-login";
import { WebViewContainer } from "./features/webview";
import {
  ForceUpdateScreen,
  useForceUpdateCheck,
} from "./features/version-check";

// Sentry 초기화
Sentry.init({
  dsn: "https://4fde45e54533ab79b9a06e91f7ba1673@o4510191631466496.ingest.de.sentry.io/4510191648243792",
  // Adds more context data to events (IP address, cookies, user, etc.)
  sendDefaultPii: true,
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
  tracesSampleRate: 1.0,
  // Enable logs to be sent to Sentry
  enableLogs: true,
});

function AppContent() {
  const insets = useSafeAreaInsets();

  // 강제 업데이트 체크 (AppState 모니터링 포함)
  const { forceUpdateRequired, updateMessage, storeUrl, onUpdatePress } =
    useForceUpdateCheck();

  // WebView ref를 한 번만 선언하고 모든 훅에서 공유
  const webViewRef = React.useRef<WebView | null>(null);

  // 알림으로부터 초기 URL 결정
  const initialUrl = useInitialUrlFromNotification(WEBVIEW_URL);

  // 앱 초기화 (ATT → AppsFlyer → 푸시 알림 순차 실행)
  useAppInitialization(webViewRef);

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

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* 강제 업데이트 화면 - 최상단 레이어 */}
      {forceUpdateRequired && (
        <ForceUpdateScreen
          message={updateMessage}
          storeUrl={storeUrl}
          onUpdatePress={onUpdatePress}
        />
      )}

      {/* WebView 컨테이너 - 백그라운드에서 프리로딩 */}
      <WebViewContainer
        webViewRef={webViewRef}
        onMessage={handleCombinedMessage}
        initialUrl={initialUrl}
      />
    </View>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
