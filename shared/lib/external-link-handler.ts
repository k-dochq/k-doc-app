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
  "dev.k-doc.kr",
];

/**
 * URL에서 pathname 추출 (쿼리 파라미터 제외)
 */
function extractPathname(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname;
  } catch (error) {
    // URL 파싱 실패 시 원본 URL에서 pathname 추출 시도
    const match = url.match(/^https?:\/\/[^/]+(\/[^?#]*)/);
    return match ? match[1] : url;
  }
}

/**
 * URL이 내부 도메인인지 확인
 */
function isInternalDomain(url: string): boolean {
  return INTERNAL_DOMAINS.some((domain) => url.includes(domain));
}

/**
 * payment 경로인지 확인
 * 정확히 `/payment` 또는 `/{locale}/payment` 경로만 체크 (하위 경로 제외)
 */
function isPaymentPath(pathname: string): boolean {
  // 정확히 `/payment` 경로 체크
  if (pathname === "/payment") {
    return true;
  }

  // 정확히 `/{locale}/payment` 경로 체크 (locale은 2-3자 알파벳)
  const localePaymentPattern = /^\/[a-z]{2,3}\/payment$/;
  return localePaymentPattern.test(pathname);
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
 * 내부 도메인이면서 payment 경로인 경우에도 외부 브라우저에서 열기
 */
export function handleShouldStartLoadWithRequest(
  request: ShouldStartLoadWithRequestParams
): boolean {
  const { url } = request;

  console.log("url", url);

  // 내부 도메인 체크
  const isInternal = isInternalDomain(url);

  if (isInternal) {
    // 내부 도메인이면 payment 경로 체크
    const pathname = extractPathname(url);
    if (isPaymentPath(pathname)) {
      // 내부 도메인이면서 payment 경로인 경우 외부 브라우저에서 열기
      openExternalLink(url);
      return false; // 웹뷰에서 로드하지 않음
    }
    // 내부 도메인이면서 payment 경로가 아닌 경우 웹뷰에서 로드
    return true;
  }

  // 내부 도메인이 아닌 경우 외부 브라우저에서 열기
  openExternalLink(url);
  return false; // 웹뷰에서 로드하지 않음
}

/**
 * 외부 링크 처리 관련 타입들
 */
export type { ShouldStartLoadWithRequestParams };
