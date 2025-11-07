import { useEffect } from "react";
import { AppState } from "react-native";
import * as Notifications from "expo-notifications";
import { WebView } from "react-native-webview";
import { createNotificationClickHandler } from "../lib/notificationClickHandler";
import { getAndRegisterPushToken } from "../lib/pushTokenManager";

// 포그라운드 알림 리스너 타입
type ForegroundNotificationHandler = (
  notification: Notifications.Notification
) => void;

// 전역 포그라운드 알림 핸들러 (스낵바에서 사용)
let foregroundNotificationHandler: ForegroundNotificationHandler | null = null;

export function setForegroundNotificationHandler(
  handler: ForegroundNotificationHandler | null
) {
  foregroundNotificationHandler = handler;
}

// 알림 핸들러 설정 - 포그라운드에서 OS 시스템 알림 비활성화
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false, // 포그라운드에서 OS 시스템 알림 비활성화
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: false, // 포그라운드에서 배너 비활성화
    shouldShowList: false, // 포그라운드에서 리스트 비활성화
  }),
});

// 독립 함수: 푸시 토큰 등록
export async function registerPushToken(
  webViewRef: React.RefObject<WebView | null>
) {
  try {
    console.log("🔔 Registering push token...");

    // 푸시 토큰 가져오기 및 등록 실행
    await getAndRegisterPushToken();

    // 알림 수신 리스너 (포그라운드에서만 스낵바 표시)
    const notificationReceivedSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        // 포그라운드 상태 확인
        const appState = AppState.currentState;
        if (appState === "active" && foregroundNotificationHandler) {
          // 포그라운드일 때만 스낵바 표시
          foregroundNotificationHandler(notification);
        }
      });

    // 알림 클릭 리스너
    const notificationResponseSubscription =
      Notifications.addNotificationResponseReceivedListener(
        createNotificationClickHandler(webViewRef)
      );

    console.log("✅ Push notifications initialized");

    // 정리 함수 반환 (필요시 사용)
    return () => {
      notificationReceivedSubscription.remove();
      notificationResponseSubscription.remove();
    };
  } catch (error) {
    console.error("❌ Push notification registration failed:", error);
  }
}

// 기존 훅 (하위 호환성 유지)
export function usePushNotifications(
  webViewRef: React.RefObject<WebView | null>
) {
  useEffect(() => {
    registerPushToken(webViewRef);
  }, [webViewRef]);
}
