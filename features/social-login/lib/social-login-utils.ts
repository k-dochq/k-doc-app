/**
 * 소셜로그인 관련 유틸리티 함수들
 */

import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Alert } from "react-native";
import { supabase } from "shared/lib/supabase";
import type {
  SocialProvider,
  WebViewLoginRequest,
} from "shared/types/webview-messages";
import { DEEP_LINK_CONFIG } from "../../../constants/config";

/**
 * 딥링크 URI 생성
 */
export function createDeepLinkUri(): string {
  return AuthSession.makeRedirectUri({
    scheme: DEEP_LINK_CONFIG.scheme,
    path: DEEP_LINK_CONFIG.callbackPath,
  });
}

/**
 * 소셜로그인 시작
 */
export async function startSocialLogin(
  provider: SocialProvider
): Promise<void> {
  try {
    const redirectTo = createDeepLinkUri();

    // skipBrowserRedirect는 모두 false로 설정 (시스템 브라우저 사용)
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: DEEP_LINK_CONFIG.redirectUri,
        skipBrowserRedirect: false,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      throw error;
    }

    if (data.url) {
      // 시스템 브라우저 사용 (SFSafariViewController/Chrome Custom Tabs)
      await WebBrowser.openBrowserAsync(data.url);
    }
  } catch (error) {
    Alert.alert(
      "Login Failed",
      `An error occurred during ${provider} login. Please try again.`
    );
  }
}

/**
 * 웹뷰 메시지 파싱 및 검증
 */
export function parseWebViewMessage(
  messageData: string
): WebViewLoginRequest | null {
  try {
    const message = JSON.parse(messageData) as WebViewLoginRequest;

    if (
      message.source === "kdoc-web" &&
      message.type === "LOGIN_REQUEST" &&
      (message.provider === "google" || message.provider === "apple")
    ) {
      return message;
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * 웹뷰로 에러 메시지 전송
 */
export function sendErrorToWebView(webViewRef: any, error: string): void {
  if (webViewRef.current) {
    const errorMessage = JSON.stringify({
      source: "kdoc-app",
      type: "LOGIN_RESPONSE",
      success: false,
      error,
    });

    webViewRef.current.postMessage(errorMessage);
  }
}
