// pushTokenManager.ts
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { registerPushTokenToServer } from "./pushTokenService";
import { supabase } from "./supabase";

/**
 * 푸시 토큰을 가져와서 서버에 등록하는 함수
 * @returns 등록 결과
 */
export async function getAndRegisterPushToken(): Promise<{
  success: boolean;
  error?: string;
  token?: string;
  userId?: string;
}> {
  try {
    // Android 알림 채널 설정
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    // 실기기 확인
    if (!Device.isDevice) {
      console.warn("⚠️ 실기기에서만 푸시 알림 동작");
      return { success: false, error: "실기기에서만 푸시 알림 동작" };
    }

    // 권한 확인 및 요청
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      throw new Error("푸시 알림 권한이 거부되었습니다");
    }

    // 프로젝트 ID 확인
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    if (!projectId) {
      throw new Error("❌ projectId 누락 - EAS 프로젝트 ID를 확인해주세요");
    }

    // Expo 푸시 토큰 생성
    const pushToken = (await Notifications.getExpoPushTokenAsync({ projectId }))
      .data;

    // 현재 세션 가져오기
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;

    console.log("session", session);

    if (pushToken && session?.user?.id) {
      // 푸시 토큰을 서버에 등록
      const result = await registerPushTokenToServer(
        pushToken,
        session.user.id
      );

      if (result.success) {
        console.log("✅ 푸시 토큰 등록 성공");
        return {
          success: true,
          token: pushToken,
          userId: session.user.id,
        };
      } else {
        console.error("❌ 푸시 토큰 등록 실패:", result.error);
        return {
          success: false,
          error: result.error,
          token: pushToken,
          userId: session.user.id,
        };
      }
    } else {
      return {
        success: false,
        error: "세션이 없거나 푸시 토큰을 가져올 수 없습니다",
        token: pushToken,
      };
    }
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "푸시 알림 등록에 실패했습니다";
    console.error("푸시 알림 등록 실패:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
