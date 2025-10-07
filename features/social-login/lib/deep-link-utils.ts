/**
 * 딥링크 처리 관련 유틸리티 함수들
 */

import * as Linking from "expo-linking";
import { Alert } from "react-native";
import { WebView } from "react-native-webview";
import type { DeepLinkParams } from "shared/types/webview-messages";
import { WEBVIEW_CONFIG } from "../../../constants/config";

/**
 * 딥링크 URL 파싱 (Supabase OAuth 응답 처리)
 */
export function parseDeepLinkUrl(url: string): DeepLinkParams | null {
  try {
    // URL fragment에서 access_token 추출 (Supabase OAuth 응답)
    if (url.includes("#access_token=")) {
      const fragment = url.split("#")[1];
      const params = new URLSearchParams(fragment);

      const accessToken = params.get("access_token");
      const error = params.get("error");
      const errorDescription = params.get("error_description");

      if (accessToken) {
        return {
          code: accessToken,
          error: error || undefined,
          error_description: errorDescription || undefined,
        };
      }

      if (error) {
        return {
          error: error,
          error_description: errorDescription || undefined,
        };
      }
    }

    // 일반적인 쿼리 파라미터 처리
    const parsed = Linking.parse(url);
    return parsed.queryParams as DeepLinkParams;
  } catch (error) {
    return null;
  }
}

/**
 * 웹뷰 콜백 URL 생성
 */
export function createWebViewCallbackUrl(
  code: string,
  baseUrl: string = WEBVIEW_CONFIG.baseUrl
): string {
  return `${baseUrl}/auth/callback?code=${encodeURIComponent(code)}`;
}

/**
 * 웹뷰로 콜백 URL 로드
 */
export async function loadCallbackInWebView(
  webViewRef: React.RefObject<WebView | null>,
  code: string
): Promise<void> {
  try {
    const callbackUrl = createWebViewCallbackUrl(code);

    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(
        `window.location.href = '${callbackUrl}';`
      );
    }
  } catch (error) {
    Alert.alert("Error", "Failed to return to the app after login.");
  }
}

/**
 * 딥링크 이벤트 리스너 설정
 */
export function setupDeepLinkListener(
  webViewRef: React.RefObject<WebView | null>,
  onDeepLink: (params: DeepLinkParams) => void
): () => void {
  const handleDeepLink = (event: { url: string }) => {
    const params = parseDeepLinkUrl(event.url);
    if (params) {
      onDeepLink(params);
    }
  };

  const subscription = Linking.addEventListener("url", handleDeepLink);
  return () => subscription.remove();
}

/**
 * 초기 딥링크 확인 (앱이 콜드스타트로 열렸을 때)
 */
export async function checkInitialDeepLink(): Promise<string | null> {
  try {
    return await Linking.getInitialURL();
  } catch (error) {
    return null;
  }
}
