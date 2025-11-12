/**
 * 소셜로그인 메인 로직
 */

import { useRef } from "react";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import {
  startSocialLogin,
  parseWebViewMessage,
} from "../lib/social-login-utils";
import type { WebViewLoginRequest } from "shared/types/webview-messages";

/**
 * 소셜로그인 훅
 */
export function useSocialLogin(webViewRef: React.RefObject<WebView | null>) {
  // 웹뷰 메시지에서 받은 로케일과 리다이렉트 경로를 저장
  const loginContextRef = useRef<{ locale?: string; redirectPath?: string }>(
    {}
  );

  // 웹뷰 메시지 처리
  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    try {
      const message = parseWebViewMessage(
        event.nativeEvent.data
      ) as WebViewLoginRequest;

      if (message) {
        // 로케일과 리다이렉트 경로 저장
        loginContextRef.current = {
          locale: message.locale,
          redirectPath: message.redirectPath,
        };

        // Provider별 처리 (Google: 시스템 브라우저, Apple: 외부 Safari)
        startSocialLogin(message.provider);
      }
    } catch (error) {
      // 에러 무시
    }
  };

  return {
    handleWebViewMessage,
    loginContextRef,
  };
}
