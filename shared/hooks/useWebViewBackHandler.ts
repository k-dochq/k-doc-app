import { useEffect, useRef, RefObject } from "react";
import { BackHandler } from "react-native";
import { WebView, WebViewNavigation } from "react-native-webview";

interface UseWebViewBackHandlerReturn {
  webViewRef: RefObject<WebView | null>;
  handleNavigationStateChange: (navState: WebViewNavigation) => void;
}

/**
 * 안드로이드 백버튼으로 웹뷰 뒤로가기를 처리하는 커스텀 훅
 * WebView ref와 navigation state change 핸들러를 함께 제공합니다.
 */
export function useWebViewBackHandler(): UseWebViewBackHandlerReturn {
  const webViewRef = useRef<WebView>(null);
  const canGoBackRef = useRef(false);

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    canGoBackRef.current = navState.canGoBack;
  };

  useEffect(() => {
    const onBackPress = () => {
      if (canGoBackRef.current && webViewRef.current) {
        webViewRef.current.goBack();
        return true; // 기본 동작(앱 종료) 방지
      }
      return false; // 기본 동작 수행
    };

    // 백버튼 이벤트 리스너 등록
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => subscription.remove();
  }, []);

  return {
    webViewRef,
    handleNavigationStateChange,
  };
}
