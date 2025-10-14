// pushTokenService.ts
import { Platform } from "react-native";
import Constants from "expo-constants";
import { WEBVIEW_URL } from "../../constants/urls";

interface PushTokenRegistrationResponse {
  success: boolean;
  message?: string;
  error?: string;
  details?: string;
  data?: { userId: string; platform: "ios" | "android"; appVersion: string };
}

/**
 * 푸시 토큰을 서버에 등록하는 함수
 * @param pushToken - Expo 푸시 토큰
 * @param userId - 사용자 ID
 * @returns 등록 결과
 */
export async function registerPushTokenToServer(
  pushToken: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${WEBVIEW_URL}/api/push/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: pushToken,
        platform: Platform.OS as "ios" | "android",
        appVersion: Constants.expoConfig?.version ?? "dev",
        userId: userId,
      }),
    });

    const result: PushTokenRegistrationResponse = await res.json();
    if (!res.ok || !result.success) {
      console.error("❌ 푸시 토큰 등록 실패:", result.error || res.statusText);
      return { success: false, error: result.error || res.statusText };
    }

    console.log("✅ 푸시 토큰 등록 성공:", result.message || "");
    return { success: true };
  } catch (e) {
    console.error("푸시 토큰 등록 요청 실패:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}
