import { useEffect, useState } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

// 알림 핸들러 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushNotificationHook {
  token: string | null;
  isLoading: boolean;
  error: string | null;
  registerForPush: () => Promise<void>;
}

export function usePushNotifications(): PushNotificationHook {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const registerForPushAsync = async (): Promise<string | null> => {
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
        return null;
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

      console.log("projectId", projectId);

      // Expo 푸시 토큰 생성
      const pushToken = (
        await Notifications.getExpoPushTokenAsync({ projectId })
      ).data;
      return pushToken;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다";
      console.error("푸시 알림 등록 실패:", errorMessage);
      throw new Error(errorMessage);
    }
  };

  const registerForPush = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const pushToken = await registerForPushAsync();
      setToken(pushToken);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "푸시 알림 등록에 실패했습니다";
      setError(errorMessage);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 초기 푸시 알림 등록
    registerForPush();

    // 알림 수신 리스너
    const notificationReceivedSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("📩 알림 수신:", notification);
      });

    // 알림 클릭 리스너
    const notificationResponseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("🖱️ 알림 클릭:", response);
      });

    // 정리 함수
    return () => {
      notificationReceivedSubscription.remove();
      notificationResponseSubscription.remove();
    };
  }, []);

  return {
    token,
    isLoading,
    error,
    registerForPush,
  };
}
