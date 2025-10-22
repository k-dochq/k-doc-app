import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { WebView } from "react-native-webview";
import { createNotificationClickHandler } from "../lib/notificationClickHandler";
import { getAndRegisterPushToken } from "../lib/pushTokenManager";

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

// 독립 함수: 푸시 토큰 등록
export async function registerPushToken(
  webViewRef: React.RefObject<WebView | null>
) {
  try {
    console.log("🔔 Registering push token...");

    // 푸시 토큰 가져오기 및 등록 실행
    await getAndRegisterPushToken();

    // 알림 수신 리스너
    const notificationReceivedSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        // 알림 수신 처리
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
