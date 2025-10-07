/**
 * 딥링크 처리 관련 유틸리티 함수들
 */

import { WEBVIEW_URL } from "constants/urls";
import * as Linking from "expo-linking";
import { Alert } from "react-native";
import { WebView } from "react-native-webview";
import type { DeepLinkParams } from "shared/types/webview-messages";

/**
 * 딥링크 URL 파싱 (Supabase OAuth 응답 처리)
 */
export function parseDeepLinkUrl(url: string): DeepLinkParams | null {
  try {
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
  baseUrl: string = WEBVIEW_URL
): string {
  return `${baseUrl}/auth/callback?code=${encodeURIComponent(code)}`;
}

/**
 * 웹뷰 set-session URL 생성 (액세스/리프레시 토큰 전달)
 */
export function createWebViewSetSessionUrl(
  accessToken: string,
  refreshToken: string,
  locale?: string,
  redirectPath?: string,
  baseUrl: string = WEBVIEW_URL
): string {
  const params = new URLSearchParams({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (locale) {
    params.append("locale", locale);
  }

  if (redirectPath) {
    params.append("redirectPath", redirectPath);
  }

  return `${baseUrl}/auth/set-session?${params.toString()}`;
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
 * 웹뷰로 set-session URL 로드 (토큰 쿠키 설정 유도)
 */
export async function loadSetSessionInWebView(
  webViewRef: React.RefObject<WebView | null>,
  accessToken: string,
  refreshToken: string,
  locale?: string,
  redirectPath?: string
): Promise<void> {
  try {
    const url = createWebViewSetSessionUrl(
      accessToken,
      refreshToken,
      locale,
      redirectPath
    );
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`window.location.href = '${url}';`);
    }
  } catch (error) {
    Alert.alert("Error", "Failed to set session in WebView.");
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
