/**
 * 딥링크 처리 훅
 * 모든 딥링크를 받아서 경로별로 분기 처리합니다.
 */

import { useEffect } from "react";
import { WebView } from "react-native-webview";
import {
  setupDeepLinkListener,
  checkInitialDeepLink,
  parseDeepLinkUrl,
} from "../../features/social-login/lib/deep-link-utils";
import { handleSocialLoginDeepLink } from "../../features/social-login/lib/social-login-deep-link-handler";
import type { DeepLinkParams } from "../types/webview-messages";

interface UseDeepLinkHandlerProps {
  webViewRef: React.RefObject<WebView | null>;
  loginContext: React.MutableRefObject<{
    locale?: string;
    redirectPath?: string;
  }>;
}

/**
 * 딥링크 처리 훅
 * @param webViewRef 웹뷰 참조
 * @param loginContext 로그인 컨텍스트 (locale, redirectPath)
 */
export function useDeepLinkHandler({
  webViewRef,
  loginContext,
}: UseDeepLinkHandlerProps): void {
  useEffect(() => {
    const handleDeepLink = async (params: DeepLinkParams) => {
      console.log(
        "[useDeepLinkHandler] 딥링크 수신:",
        JSON.stringify(params, null, 2)
      );
      const pathname = params.pathname;
      console.log("[useDeepLinkHandler] pathname:", pathname);

      // 경로별 분기 처리
      // pathname이 /auth/callback, auth/callback, /auth/callback/ 등 다양한 형식일 수 있음
      const normalizedPathname = pathname?.replace(/^\/+|\/+$/g, ""); // 앞뒤 슬래시 제거

      if (
        normalizedPathname === "auth/callback" ||
        pathname === "/auth/callback" ||
        pathname?.includes("auth/callback")
      ) {
        // 소셜 로그인 딥링크 처리
        console.log("[useDeepLinkHandler] 소셜 로그인 딥링크 처리 시작");
        await handleSocialLoginDeepLink(
          params,
          webViewRef,
          loginContext.current
        );
      } else if (
        normalizedPathname === "payment/return" ||
        pathname === "/payment/return" ||
        pathname?.includes("payment/return")
      ) {
        // 결제 완료 딥링크 - 별도 처리 없이 앱으로 돌아오기만 함
        console.log("[useDeepLinkHandler] 결제 완료 딥링크 수신:", params);
        // 아무것도 하지 않음
      } else {
        // 알 수 없는 경로 - 하지만 code가 있으면 소셜 로그인으로 처리 (하위 호환성)
        if (params.code) {
          console.log(
            "[useDeepLinkHandler] pathname이 없지만 code가 있음 - 소셜 로그인으로 처리"
          );
          await handleSocialLoginDeepLink(
            params,
            webViewRef,
            loginContext.current
          );
        } else {
          console.log("[useDeepLinkHandler] 알 수 없는 딥링크 경로:", pathname);
          console.log(
            "[useDeepLinkHandler] 전체 params:",
            JSON.stringify(params, null, 2)
          );
        }
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
  }, [webViewRef, loginContext]);
}
