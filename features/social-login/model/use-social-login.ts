/**
 * 소셜로그인 메인 로직
 */

import { useEffect, useRef } from "react";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import {
  startSocialLogin,
  parseWebViewMessage,
} from "../lib/social-login-utils";
import {
  setupDeepLinkListener,
  checkInitialDeepLink,
  parseDeepLinkUrl,
  loadSetSessionInWebView,
} from "../lib/deep-link-utils";
import type {
  DeepLinkParams,
  WebViewLoginRequest,
} from "shared/types/webview-messages";
import { supabase } from "shared/lib/supabase";
import { getAndRegisterPushToken } from "shared/lib/pushTokenManager";

/**
 * 소셜로그인 훅
 */
export function useSocialLogin(webViewRef: React.RefObject<WebView | null>) {
  // 웹뷰 메시지에서 받은 로케일과 리다이렉트 경로를 저장
  const loginContextRef = useRef<{ locale?: string; redirectPath?: string }>(
    {}
  );

  // 딥링크 처리
  useEffect(() => {
    const handleDeepLink = async (params: DeepLinkParams) => {
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
              loginContextRef.current.locale,
              loginContextRef.current.redirectPath
            );
          } else {
            Alert.alert(
              "Login Failed",
              "Missing tokens from Supabase session."
            );
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
