import { useEffect, useRef } from "react";
import {
  requestTrackingPermissionsAsync,
  PermissionStatus,
} from "expo-tracking-transparency";
import { WebView } from "react-native-webview";
import { initAppsFlyer } from "../../libs/appsflyer";
import { registerPushToken } from "./usePushNotifications";

/**
 * 앱 초기화 시 필요한 모든 권한을 순차적으로 요청하는 훅
 * ATT 권한 → AppsFlyer 초기화 → 푸시 알림 권한 순서로 실행
 */
export function useAppInitialization(
  webViewRef: React.RefObject<WebView | null>
) {
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    (async () => {
      try {
        console.log("🚀 Starting app initialization...");

        // 1단계: ATT 권한 요청
        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log("🔍 Step 1: Requesting ATT permission...");

        const { status } = await requestTrackingPermissionsAsync();
        console.log("📋 ATT result:", status);

        // 2단계: ATT 결과 관계없이 AppsFlyer 초기화 (딥링크는 ATT 비허용 시에도 동작해야 함)
        console.log(`📋 ATT status: ${status}, initializing AppsFlyer...`);
        await initAppsFlyer();
        console.log("✅ AppsFlyer initialized");

        // 3단계: 푸시 알림 권한 요청 (ATT 이후)
        console.log("🔔 Step 2: Requesting push notification permission...");
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // usePushNotifications의 로직을 여기서 실행
        await registerPushToken(webViewRef);

        console.log("✅ App initialization completed");
      } catch (error) {
        console.error("❌ App initialization failed:", error);
      }
    })();
  }, [webViewRef]);
}
