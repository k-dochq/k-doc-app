/**
 * 소셜로그인 관련 유틸리티 함수들
 */

import * as AuthSession from "expo-auth-session";
import * as Linking from "expo-linking";
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
  const uri = AuthSession.makeRedirectUri({
    scheme: DEEP_LINK_CONFIG.scheme, // app.json의 scheme과 일치해야 함
    path: DEEP_LINK_CONFIG.callbackPath,
  });

  console.log("🔗 Generated deep link URI:", uri);
  return uri;
}

/**
 * 소셜로그인 시작
 */
export async function startSocialLogin(
  provider: SocialProvider
): Promise<void> {
  try {
    console.log("🚀 Starting social login process...");
    console.log("📱 Provider:", provider);

    const redirectTo = createDeepLinkUri();
    console.log("🎯 Redirect URL:", redirectTo);

    // Supabase 설정 확인 (공개 정보만)
    console.log("⚙️ Supabase URL:", "https://hmzwblmwusrxbyqcvtlu.supabase.co");
    console.log(
      "🔑 Supabase Anon Key:",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    );

    console.log("📡 Calling Supabase signInWithOAuth...");
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        // PKCE 플로우 사용 (보안상 권장)
        skipBrowserRedirect: false,
        // 추가 디버깅을 위한 쿼리 파라미터
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      console.error("❌ Supabase OAuth Error:", error);
      console.error("❌ Error details:", {
        message: error.message,
        status: error.status,
        name: error.name,
      });
      throw error;
    }

    console.log("✅ Supabase OAuth initiated successfully");
    console.log("📊 OAuth Response Data:", {
      url: data.url ? "Present" : "Missing",
      provider: data.provider,
    });

    // OAuth URL 상세 분석
    if (data.url) {
      console.log("🌐 Full OAuth URL:", data.url);

      // URL 파라미터 분석
      try {
        const url = new URL(data.url);
        console.log("🔍 URL Analysis:");
        console.log("  - Protocol:", url.protocol);
        console.log("  - Host:", url.host);
        console.log("  - Pathname:", url.pathname);
        console.log(
          "  - Redirect URI param:",
          url.searchParams.get("redirect_to")
        );
        console.log("  - Client ID param:", url.searchParams.get("client_id"));
        console.log(
          "  - Response Type:",
          url.searchParams.get("response_type")
        );
        console.log("  - Scope:", url.searchParams.get("scope"));
      } catch (urlError) {
        console.warn("⚠️ Failed to parse OAuth URL:", urlError);
      }

      console.log("🌍 Opening browser with OAuth URL...");
      await Linking.openURL(data.url);
      console.log("✅ Browser opened successfully");
    } else {
      console.error("❌ No OAuth URL returned from Supabase");
    }
  } catch (error) {
    console.error(`❌ ${provider} login error:`, error);
    console.error(
      "❌ Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    Alert.alert(
      "Login Failed",
      `An error occurred during ${provider} login. Please try again.\n\nError: ${
        error instanceof Error ? error.message : String(error)
      }`
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
    console.log("📨 Received WebView message:", messageData);

    const message = JSON.parse(messageData) as WebViewLoginRequest;
    console.log("📋 Parsed message:", message);

    // 메시지 타입 검증
    if (
      message.source === "kdoc-web" &&
      message.type === "LOGIN_REQUEST" &&
      (message.provider === "google" || message.provider === "apple")
    ) {
      console.log("✅ Valid login request received");
      return message;
    }

    console.log("❌ Invalid message format");
    return null;
  } catch (error) {
    console.warn("⚠️ Failed to parse webview message:", error);
    return null;
  }
}

/**
 * 웹뷰로 에러 메시지 전송
 */
export function sendErrorToWebView(webViewRef: any, error: string): void {
  console.log("📤 Sending error to WebView:", error);

  if (webViewRef.current) {
    const errorMessage = JSON.stringify({
      source: "kdoc-app",
      type: "LOGIN_RESPONSE",
      success: false,
      error,
    });

    console.log("📨 Error message payload:", errorMessage);
    webViewRef.current.postMessage(errorMessage);
    console.log("✅ Error message sent to WebView");
  } else {
    console.warn("⚠️ WebView ref is not available");
  }
}

/**
 * 딥링크 디버깅 함수
 */
export function debugDeepLink(url: string): void {
  console.log("🔗 Deep link received:", url);

  try {
    const parsed = Linking.parse(url);
    console.log("📊 Parsed deep link:", parsed);
    console.log("  - Scheme:", parsed.scheme);
    console.log("  - Host:", parsed.hostname);
    console.log("  - Path:", parsed.path);
    console.log("  - Query params:", parsed.queryParams);
  } catch (error) {
    console.error("❌ Failed to parse deep link:", error);
  }
}
