/**
 * 소셜로그인 메인 로직
 */

import { useEffect } from "react";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { Alert } from "react-native";
import {
  startSocialLogin,
  parseWebViewMessage,
} from "../lib/social-login-utils";
import {
  setupDeepLinkListener,
  loadCallbackInWebView,
  checkInitialDeepLink,
  parseDeepLinkUrl,
} from "../lib/deep-link-utils";
import type { DeepLinkParams } from "shared/types/webview-messages";

/**
 * 소셜로그인 훅
 */
export function useSocialLogin(webViewRef: React.RefObject<WebView | null>) {
  // 딥링크 처리
  useEffect(() => {
    const handleDeepLink = (params: DeepLinkParams) => {
      if (params.code) {
        loadCallbackInWebView(webViewRef, params.code);
      } else if (params.error) {
        Alert.alert(
          "Login Failed",
          params.error_description || "An error occurred during login."
        );
      }
    };

    const cleanup = setupDeepLinkListener(webViewRef, handleDeepLink);

    // 초기 딥링크 확인 (앱이 콜드스타트로 열렸을 때)
    checkInitialDeepLink().then((initialUrl) => {
      if (initialUrl) {
        const params = parseDeepLinkUrl(initialUrl);
        if (params) {
          handleDeepLink(params);
        }
      }
    });

    return cleanup;
  }, [webViewRef]);

  // 웹뷰 메시지 처리
  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    try {
      const message = parseWebViewMessage(event.nativeEvent.data);

      if (message) {
        startSocialLogin(message.provider);
      }
    } catch (error) {
      // 에러 무시
    }
  };

  return {
    handleWebViewMessage,
  };
}
