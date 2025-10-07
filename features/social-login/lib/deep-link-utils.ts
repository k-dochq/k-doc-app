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
    console.log("🔗 Parsing deep link URL:", url);

    // URL fragment에서 access_token 추출 (Supabase OAuth 응답)
    if (url.includes("#access_token=")) {
      console.log("📋 Found access_token in URL fragment");
      const fragment = url.split("#")[1];
      const params = new URLSearchParams(fragment);

      const accessToken = params.get("access_token");
      const error = params.get("error");
      const errorDescription = params.get("error_description");

      console.log("🔍 Fragment analysis:");
      console.log("  - Access token:", accessToken ? "Present" : "Missing");
      console.log("  - Error:", error || "None");
      console.log("  - Error description:", errorDescription || "None");

      if (accessToken) {
        console.log("✅ Access token found in URL fragment");
        return {
          code: accessToken, // access_token을 code로 사용
          error: error || undefined,
          error_description: errorDescription || undefined,
        };
      }

      if (error) {
        console.log("❌ Error found in URL fragment:", error);
        return {
          error: error,
          error_description: errorDescription || undefined,
        };
      }
    }

    // 일반적인 쿼리 파라미터 처리
    console.log("📋 Parsing as standard query parameters");
    const parsed = Linking.parse(url);
    console.log("📊 Parsed result:", parsed);

    return parsed.queryParams as DeepLinkParams;
  } catch (error) {
    console.error("❌ Failed to parse deep link URL:", error);
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
  const callbackUrl = `${baseUrl}/auth/callback?code=${encodeURIComponent(
    code
  )}`;
  console.log("🌐 Generated callback URL:", callbackUrl);
  return callbackUrl;
}

/**
 * 웹뷰로 콜백 URL 로드
 */
export async function loadCallbackInWebView(
  webViewRef: React.RefObject<WebView | null>,
  code: string
): Promise<void> {
  try {
    console.log("📱 Loading callback in WebView...");
    console.log("🔑 Auth code:", code.substring(0, 20) + "...");

    const callbackUrl = createWebViewCallbackUrl(code);
    console.log("🎯 Target callback URL:", callbackUrl);

    if (webViewRef.current) {
      console.log("✅ WebView ref is available");

      // WebView에서 새로운 URL로 이동
      const jsCode = `window.location.href = '${callbackUrl}';`;
      console.log("💻 Injecting JavaScript:", jsCode);

      webViewRef.current.injectJavaScript(jsCode);
      console.log("✅ JavaScript injected successfully");
    } else {
      console.error("❌ WebView ref is not available");
    }
  } catch (error) {
    console.error("❌ Failed to load callback in webview:", error);
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
  console.log("🎧 Setting up deep link listener");

  const handleDeepLink = (event: { url: string }) => {
    console.log("🔗 Deep link received:", event.url);
    console.log("📊 Event details:", event);

    const params = parseDeepLinkUrl(event.url);
    if (params) {
      console.log("✅ Successfully parsed deep link params:", params);
      onDeepLink(params);
    } else {
      console.log("❌ Failed to parse deep link params");
    }
  };

  console.log("📡 Adding Linking event listener");
  const subscription = Linking.addEventListener("url", handleDeepLink);
  console.log("✅ Deep link listener setup complete");

  return () => {
    console.log("🗑️ Removing deep link listener");
    subscription.remove();
  };
}

/**
 * 초기 딥링크 확인 (앱이 콜드스타트로 열렸을 때)
 */
export async function checkInitialDeepLink(): Promise<string | null> {
  try {
    console.log("🔍 Checking for initial deep link...");
    const initialUrl = await Linking.getInitialURL();

    if (initialUrl) {
      console.log("🔗 Initial deep link found:", initialUrl);
      return initialUrl;
    } else {
      console.log("ℹ️ No initial deep link found");
      return null;
    }
  } catch (error) {
    console.error("❌ Failed to check initial deep link:", error);
    return null;
  }
}
