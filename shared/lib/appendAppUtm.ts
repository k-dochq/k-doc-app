/** 앱 유입 어트리뷰션용 UTM. GA 에서 공식 앱 세션을 구분한다. */
export const APP_UTM_QUERY = "utm_source=officialapp";

/**
 * 웹뷰 최초 로드 URL 에 UTM 을 붙인다.
 *
 * WEBVIEW_URL 상수에 직접 붙이지 않는 이유: 푸시 딥링크가 `${base}${path}` 로
 * 경로를 이어붙이므로 상수에 쿼리가 있으면 URL 이 깨진다. 최종 URL 이 조립된
 * 뒤에 이 함수로 붙여야 한다.
 */
export function appendAppUtm(url: string): string {
  if (url.includes(APP_UTM_QUERY)) return url;
  return url.includes("?") ? `${url}&${APP_UTM_QUERY}` : `${url}?${APP_UTM_QUERY}`;
}
