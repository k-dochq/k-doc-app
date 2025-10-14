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

export function usePushNotifications(
  webViewRef: React.RefObject<WebView | null>
) {
  useEffect(() => {
    // 푸시 토큰 가져오기 및 등록 실행
    getAndRegisterPushToken();

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

    // 정리 함수
    return () => {
      notificationReceivedSubscription.remove();
      notificationResponseSubscription.remove();
    };
  }, [webViewRef]);
}
