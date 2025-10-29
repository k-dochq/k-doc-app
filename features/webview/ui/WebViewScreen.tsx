import React from "react";
import { View, StyleSheet } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { WEBVIEW_URL } from "../../../constants/urls";
import {
  useAppInitialization,
  useWebViewMessageHandler,
  useWebViewShareHandler,
  useInitialUrlFromNotification,
} from "../../../shared/hooks";
import { useSocialLogin } from "../../social-login";
import { WebViewContainer } from "./WebViewContainer";
import {
  useSplashTimer,
  useSplashVisibility,
  SplashScreen,
} from "../../splash";
import { ForceUpdateScreen, useForceUpdateCheck } from "../../version-check";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = NativeStackScreenProps<RootStackParamList, "WebView">;

export function WebViewScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  // 강제 업데이트 체크 (AppState 모니터링 포함)
  const { forceUpdateRequired, updateMessage, storeUrl, onUpdatePress } =
    useForceUpdateCheck();

  // 스플래시 타이머 (1.5초 최소 시간)
  const { minTimeElapsed } = useSplashTimer();

  // WebView 상태 관리 (로딩 완료 여부)
  const [isWebViewReady, setIsWebViewReady] = React.useState(false);

  // 스플래시 표시 여부 및 페이드 애니메이션
  const { showSplash, fadeAnim } = useSplashVisibility({
    minTimeElapsed,
    isWebViewReady,
  });

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

  // WebView 로딩 완료 핸들러
  const handleWebViewLoadEnd = () => {
    setIsWebViewReady(true);
  };

  // 로딩 인디케이터 표시 여부 (3초 이상 걸릴 경우)
  const showLoadingIndicator = minTimeElapsed && !isWebViewReady;

  // 화면 포커스 관리: 포커스를 잃을 때 메모리 누수 방지
  useFocusEffect(
    React.useCallback(() => {
      // 화면이 포커스를 받을 때 (선택적: 필요한 경우만 리소스 재활성화)
      return () => {
        // 화면이 포커스를 잃을 때: WebView가 백그라운드에 있어도 메모리 누수 방지
        // React Navigation이 자동으로 cleanup하지만, 명시적으로 정리 필요시 여기서 처리
      };
    }, [])
  );

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
        showSplash={showSplash}
        onLoadEnd={handleWebViewLoadEnd}
        initialUrl={initialUrl}
        onInterceptChatRoute={(id) => {
          navigation.navigate("Chat", { id });
        }}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
