import { Linking } from "react-native";

/**
 * 외부 링크 처리 유틸리티
 * 웹뷰에서 외부 링크를 외부 브라우저로 열기 위한 로직
 */

interface ShouldStartLoadWithRequestParams {
  url: string;
}

/**
 * 앱의 내부 도메인 목록
 */
const INTERNAL_DOMAINS = [
  "172.30.1.100:3000",
  "k-doc.kr",
  "192.168.50.135:3000",
  "https://www.youtube.com",
  "accounts.google.com", // Google OAuth
  "supabase.co", // Supabase OAuth callback
];

/**
 * URL이 내부 도메인인지 확인
 */
function isInternalDomain(url: string): boolean {
  return INTERNAL_DOMAINS.some((domain) => url.includes(domain));
}

/**
 * 외부 링크를 외부 브라우저에서 열기
 */
async function openExternalLink(url: string): Promise<void> {
  try {
    await Linking.openURL(url);
  } catch (error) {
    console.error("외부 링크 열기 실패:", error);
  }
}

/**
 * 웹뷰에서 로드 요청을 처리하는 핸들러
 * 내부 링크는 웹뷰에서 로드하고, 외부 링크는 외부 브라우저에서 열기
 */
export function handleShouldStartLoadWithRequest(
  request: ShouldStartLoadWithRequestParams
): boolean {
  const { url } = request;

  console.log("url", url);

  // 내부 도메인이 아닌 경우 외부 브라우저에서 열기
  if (!isInternalDomain(url)) {
    openExternalLink(url);
    return false; // 웹뷰에서 로드하지 않음
  }

  return true; // 웹뷰에서 로드
}

/**
 * 외부 링크 처리 관련 타입들
 */
export type { ShouldStartLoadWithRequestParams };
