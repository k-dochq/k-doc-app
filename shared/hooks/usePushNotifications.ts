import { useEffect } from "react";
import { AppState, Alert } from "react-native";
import * as Notifications from "expo-notifications";
import { WebView } from "react-native-webview";
import { createNotificationClickHandler } from "../lib/notificationClickHandler";
import { getAndRegisterPushToken } from "../lib/pushTokenManager";
import { WEBVIEW_URL } from "../../constants/urls";

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

    // 알림 수신 리스너 (포그라운드에서만 Alert.alert 표시)
    const notificationReceivedSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        // 포그라운드 상태 확인
        const appState = AppState.currentState;
        if (appState === "active") {
          // 포그라운드일 때만 Alert.alert 표시
          const title = notification.request.content.title || "알림";
          const body = notification.request.content.body || "";
          const targetUrl = notification.request.content.data?.targetUrl as
            | string
            | undefined;

          // Alert.alert 표시
          const buttons = [
            {
              text: "취소",
              style: "cancel" as const,
            },
            {
              text: "확인",
              onPress: () => {
                // targetUrl이 있으면 웹뷰에서 해당 페이지로 이동
                if (targetUrl && webViewRef.current) {
                  const fullUrl = `${WEBVIEW_URL}${encodeURI(targetUrl)}`;
                  webViewRef.current.injectJavaScript(
                    `window.location.href="${fullUrl}";true;`
                  );
                }
              },
            },
          ];

          Alert.alert(title, body, buttons);
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
