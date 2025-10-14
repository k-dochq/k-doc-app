import { useEffect, useState } from "react";
import * as Notifications from "expo-notifications";

export function useInitialUrlFromNotification(defaultUrl: string) {
  const [initialUrl, setInitialUrl] = useState(defaultUrl);
  const lastNotificationResponse = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (lastNotificationResponse) {
      const target = lastNotificationResponse.notification.request.content.data
        ?.targetUrl as string | undefined;

      if (target) {
        const full = `${defaultUrl}${encodeURI(target)}`;
        setInitialUrl(full); // ← 웹뷰가 처음 뜰 때부터 이 URL로 시작
      }
    }
  }, [lastNotificationResponse, defaultUrl]);

  return initialUrl;
}
