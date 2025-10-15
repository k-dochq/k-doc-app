/**
 * 버전 정책 API 서비스
 * 서버에서 앱 버전 정책 정보를 가져오는 함수들
 */

import { Platform } from "react-native";
import { WEBVIEW_URL } from "../../constants/urls";

export interface VersionPolicy {
  minSupportedVersion: string;
  latestVersion: string;
  forceOn: boolean;
  storeUrl: string;
  message: string;
}

export interface VersionPolicyResponse {
  ios: VersionPolicy;
  android: VersionPolicy;
}

/**
 * 서버에서 버전 정책 정보를 가져오는 함수
 * @returns 버전 정책 정보 또는 null (에러 시)
 */
export async function fetchVersionPolicy(): Promise<VersionPolicyResponse | null> {
  try {
    const response = await fetch(`${WEBVIEW_URL}/api/version-policy`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        "❌ 버전 정책 API 호출 실패:",
        response.status,
        response.statusText
      );
      return null;
    }

    const policy: VersionPolicyResponse = await response.json();
    console.log("✅ 버전 정책 정보 로드 성공:", policy);
    return policy;
  } catch (error) {
    console.error("❌ 버전 정책 API 요청 실패:", error);
    return null;
  }
}

/**
 * 현재 플랫폼의 버전 정책을 가져오는 함수
 * @returns 현재 플랫폼의 버전 정책 또는 null
 */
export async function getCurrentPlatformPolicy(): Promise<VersionPolicy | null> {
  const policy = await fetchVersionPolicy();
  if (!policy) return null;

  const platform = Platform.OS as "ios" | "android";
  return policy[platform] || null;
}
