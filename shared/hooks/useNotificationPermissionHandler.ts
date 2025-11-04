import { Linking } from "react-native";
import { WebView } from "react-native-webview";
import * as Notifications from "expo-notifications";
import type {
  NotificationPermissionRequest,
  NotificationPermissionResponse,
} from "../types/webview-messages";

export function useNotificationPermissionHandler(
  webViewRef: React.RefObject<WebView | null>
) {
  const handleWebViewMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "NOTIFICATION_PERMISSION_REQUEST") {
        await handleNotificationPermissionRequest(webViewRef);
      } else if (data.type === "OPEN_NOTIFICATION_SETTINGS_REQUEST") {
        await handleOpenNotificationSettings();
      }
    } catch (err) {
      console.warn("알림 권한 메시지 파싱 에러:", err);
    }
  };

  const handleNotificationPermissionRequest = async (
    webViewRef: React.RefObject<WebView | null>
  ) => {
    try {
      console.log("🔔 알림 권한 요청 받음");

      const { status } = await Notifications.getPermissionsAsync();

      const response: NotificationPermissionResponse = {
        source: "kdoc-app",
        type: "NOTIFICATION_PERMISSION_RESPONSE",
        granted: status === "granted",
        status: status as "granted" | "denied" | "undetermined",
      };

      if (webViewRef.current) {
        // injectJavaScript를 사용하여 웹의 전역 핸들러 함수 직접 호출
        const script = `
          (function() {
            try {
              const response = ${JSON.stringify(response)};
              if (window.__handleNotificationPermissionResponse) {
                window.__handleNotificationPermissionResponse(response);
              } else {
                console.warn('알림 권한 응답 핸들러가 등록되지 않았습니다.');
              }
            } catch (e) {
              console.error('알림 권한 응답 전송 에러:', e);
            }
          })();
          true; // iOS WebView에서 eval 결과가 필요함
        `;

        webViewRef.current.injectJavaScript(script);
        console.log("✅ 알림 권한 응답 전송:", response);
      }
    } catch (error) {
      console.error("알림 권한 확인 중 오류:", error);

      // 에러 시에도 응답 전송
      const errorResponse: NotificationPermissionResponse = {
        source: "kdoc-app",
        type: "NOTIFICATION_PERMISSION_RESPONSE",
        granted: false,
        status: "denied",
      };

      if (webViewRef.current) {
        const script = `
          (function() {
            try {
              const response = ${JSON.stringify(errorResponse)};
              if (window.__handleNotificationPermissionResponse) {
                window.__handleNotificationPermissionResponse(response);
              } else {
                console.warn('알림 권한 응답 핸들러가 등록되지 않았습니다.');
              }
            } catch (e) {
              console.error('알림 권한 응답 전송 에러:', e);
            }
          })();
          true;
        `;
        webViewRef.current.injectJavaScript(script);
      }
    }
  };

  const handleOpenNotificationSettings = async () => {
    try {
      console.log("⚙️ 알림 설정 열기 요청 받음");

      // 안드로이드와 iOS 모두에서 알림 설정 화면으로 이동
      // Linking.openSettings()는 플랫폼에 관계없이 앱 설정 화면으로 이동
      await Linking.openSettings();

      console.log("✅ 알림 설정 화면 열기 완료");
    } catch (error) {
      console.error("알림 설정 열기 중 오류:", error);
    }
  };

  return {
    handleWebViewMessage,
  };
}
