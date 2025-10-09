import { useEffect } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { supabase } from "../lib/supabase";
import { WEBVIEW_URL } from "../../constants/urls";

interface PushTokenRegistrationResponse {
  success: boolean;
  message?: string;
  error?: string;
  details?: string;
  data?: {
    userId: string;
    platform: "ios" | "android";
    appVersion: string;
  };
}

export function usePushTokenRegistration(pushToken: string | null) {
  useEffect(() => {
    const registerPushToken = async () => {
      if (!pushToken) {
        console.log("푸시 토큰이 없어서 등록을 건너뜁니다");
        return;
      }

      try {
        // 현재 세션 가져오기 (getSession 사용)
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.warn("세션 조회 실패:", sessionError.message);
          return;
        }

        if (!session) {
          console.log("로그인된 사용자가 없어서 푸시 토큰 등록을 건너뜁니다");
          return;
        }

        console.log("푸시 토큰 등록 시작:", {
          userId: session.user.id,
          email: session.user.email,
          token: pushToken.substring(0, 20) + "...",
        });

        // API 요청
        const response = await fetch(`${WEBVIEW_URL}/api/push/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: pushToken,
            platform: Platform.OS as "ios" | "android",
            appVersion: Constants.expoConfig?.version ?? "dev",
          }),
        });

        const result: PushTokenRegistrationResponse = await response.json();

        if (result.success) {
          console.log("✅ 푸시 토큰 등록 성공:", result.message);
        } else {
          console.error("❌ 푸시 토큰 등록 실패:", result.error);
        }
      } catch (error) {
        console.error("푸시 토큰 등록 요청 실패:", error);
      }
    };

    registerPushToken();
  }, [pushToken]);
}
