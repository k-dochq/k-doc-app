/**
 * 소셜 로그인 딥링크 핸들러
 * kdoc://auth/callback 딥링크를 처리합니다.
 */

import { Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { WebView } from "react-native-webview";
import { supabase } from "shared/lib/supabase";
import { getAndRegisterPushToken } from "shared/lib/pushTokenManager";
import { loadSetSessionInWebView } from "./deep-link-utils";
import type { DeepLinkParams } from "shared/types/webview-messages";

/**
 * 소셜 로그인 딥링크 처리
 * @param params 딥링크 파라미터
 * @param webViewRef 웹뷰 참조
 * @param loginContext 로그인 컨텍스트 (locale, redirectPath)
 */
export async function handleSocialLoginDeepLink(
  params: DeepLinkParams,
  webViewRef: React.RefObject<WebView | null>,
  loginContext: { locale?: string; redirectPath?: string }
): Promise<void> {
  if (params.code) {
    // OAuth 콜백 감지 시 시스템 브라우저 닫기
    try {
      await WebBrowser.dismissBrowser();
    } catch (error) {
      // 브라우저가 이미 닫혔거나 없으면 에러 무시
      console.log("브라우저 닫기:", error);
    }

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(
        params.code
      );

      if (error) {
        Alert.alert(
          "Login Failed",
          error.message || "Failed to exchange code for session."
        );
        return;
      }

      const accessToken = data.session?.access_token;
      const refreshToken = data.session?.refresh_token;

      if (accessToken && refreshToken) {
        // RN에서도 세션 설정
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          console.warn("❌ RN 세션 설정 실패:", sessionError.message);
        } else {
          console.log("✅ RN 소셜 로그인 세션 설정 완료");

          // 소셜로그인 성공 시 푸시 토큰 등록
          console.log("🔔 소셜로그인 성공, 푸시 토큰 등록 시도");
          const pushResult = await getAndRegisterPushToken();
          if (pushResult.success) {
            console.log("✅ 소셜로그인 후 푸시 토큰 등록 성공");
          } else {
            console.error(
              "❌ 소셜로그인 후 푸시 토큰 등록 실패:",
              pushResult.error
            );
          }
        }

        // 웹뷰에도 세션 전달
        await loadSetSessionInWebView(
          webViewRef,
          accessToken,
          refreshToken,
          loginContext.locale,
          loginContext.redirectPath
        );
      } else {
        Alert.alert("Login Failed", "Missing tokens from Supabase session.");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      Alert.alert("Login Failed", message);
    }
  } else if (params.error) {
    Alert.alert(
      "Login Failed",
      params.error_description || "An error occurred during login."
    );
  }
}
