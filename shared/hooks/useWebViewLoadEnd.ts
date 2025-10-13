/**
 * WebView 로드 완료 시 처리할 로직들을 관리하는 훅
 */

import { useCallback } from "react";
import { WebView } from "react-native-webview";

export interface UseWebViewLoadEndProps {
  webViewRef: React.RefObject<WebView | null>;
  onWebViewLoadEnd?: () => void;
  actions?: Array<
    (webViewRef: React.RefObject<WebView | null>) => Promise<void>
  >;
}

export function useWebViewLoadEnd({
  webViewRef,
  onWebViewLoadEnd,
  actions = [],
}: UseWebViewLoadEndProps) {
  // WebView 로드 완료 시 실행할 모든 처리 로직
  const handleWebViewLoadEnd = useCallback(async () => {
    // 기존 splash screen 처리
    if (onWebViewLoadEnd) {
      onWebViewLoadEnd();
    }

    // 주입받은 액션들을 순차적으로 실행
    for (const action of actions) {
      try {
        await action(webViewRef);
      } catch (error) {
        console.error("WebView 로드 완료 액션 실행 실패:", error);
      }
    }
  }, [onWebViewLoadEnd, actions, webViewRef]);

  return {
    handleWebViewLoadEnd,
  };
}
