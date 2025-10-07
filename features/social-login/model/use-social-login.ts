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
  console.log("🎣 Initializing useSocialLogin hook");

  // 딥링크 처리
  useEffect(() => {
    console.log("🔧 Setting up deep link handling...");

    const handleDeepLink = (params: DeepLinkParams) => {
      console.log("📨 Deep link handler called with params:", params);

      if (params.code) {
        console.log(
          "✅ Auth code received:",
          params.code.substring(0, 20) + "..."
        );
        console.log("📱 Loading callback in WebView...");
        loadCallbackInWebView(webViewRef, params.code);
      } else if (params.error) {
        console.error("❌ Auth error received:", params.error);
        console.error("❌ Error description:", params.error_description);
        Alert.alert(
          "Login Failed",
          params.error_description || "An error occurred during login."
        );
      } else {
        console.warn("⚠️ Deep link received but no code or error found");
      }
    };

    console.log("🎧 Setting up deep link listener...");
    const cleanup = setupDeepLinkListener(webViewRef, handleDeepLink);

    // 초기 딥링크 확인 (앱이 콜드스타트로 열렸을 때)
    checkInitialDeepLink().then((initialUrl) => {
      if (initialUrl) {
        console.log("🔗 Processing initial deep link:", initialUrl);
        // 초기 딥링크도 처리
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
      console.log("📨 WebView message received:", event.nativeEvent.data);

      const message = parseWebViewMessage(event.nativeEvent.data);
      console.log("📋 Parsed message:", message);

      if (message) {
        console.log("✅ Valid login request received:", message);
        console.log("🚀 Starting social login for provider:", message.provider);
        startSocialLogin(message.provider);
      } else {
        console.log("❌ Invalid or unrecognized message");
      }
    } catch (error) {
      console.warn("⚠️ Failed to handle webview message:", error);
    }
  };

  console.log("✅ useSocialLogin hook initialized");
  return {
    handleWebViewMessage,
  };
}
