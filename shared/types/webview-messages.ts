/**
 * 웹뷰와의 통신을 위한 타입 정의
 */

export type SocialProvider = "google" | "apple";

/**
 * 웹뷰로부터 받는 로그인 요청 메시지 타입
 */
export interface WebViewLoginRequest {
  source: "kdoc-web";
  type: "LOGIN_REQUEST";
  provider: SocialProvider;
  redirectPath?: string;
  locale?: string;
}

/**
 * 웹뷰로 전송할 응답 메시지 타입
 */
export interface WebViewResponse {
  source: "kdoc-app";
  type: "LOGIN_RESPONSE";
  success: boolean;
  error?: string;
  authCode?: string;
}

/**
 * 웹뷰 메시지의 공통 인터페이스
 */
export interface WebViewMessage {
  source: string;
  type: string;
}

/**
 * 웹뷰로부터 받는 공유 요청 메시지 타입
 */
export interface WebViewShareRequest {
  source: "kdoc-web";
  type: "SHARE_REQUEST";
  url: string;
}

/**
 * 딥링크 파라미터 타입
 */
export interface DeepLinkParams {
  code?: string;
  error?: string;
  error_description?: string;
}
