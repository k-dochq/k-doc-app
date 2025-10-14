import * as Notifications from "expo-notifications";
import { WebView } from "react-native-webview";
import { WEBVIEW_URL } from "../../constants/urls";

/**
 * 알림 클릭 시 targetUrl이 있으면 해당 페이지로 이동하는 핸들러
 */
export function createNotificationClickHandler(
  webViewRef: React.RefObject<WebView | null>
) {
  return (response: Notifications.NotificationResponse) => {
    // targetUrl이 있으면 해당 페이지로 이동
    const targetUrl = response.notification.request.content.data?.targetUrl as
      | string
      | undefined;

    if (!targetUrl) {
      return;
    }

    const fullUrl = `${WEBVIEW_URL}${encodeURI(targetUrl)}`;

    if (webViewRef.current) {
      // WebView가 준비되어 있으면 바로 이동
      webViewRef.current.injectJavaScript(
        `window.location.href="${fullUrl}";true;`
      );
    }
  };
}
