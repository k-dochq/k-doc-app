import { useEffect, useRef } from "react";
import {
  requestTrackingPermissionsAsync,
  PermissionStatus,
} from "expo-tracking-transparency";

/**
 * ATT 동의 요청을 띄우고, 허용일 때만 onGranted() 호출.
 * Expo 공식 권장 방식을 따릅니다.
 */
export function useATTGate(onGranted: () => Promise<void> | void) {
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    (async () => {
      try {
        // 앱 안정화를 위한 최소 지연
        await new Promise((resolve) => setTimeout(resolve, 500));

        console.log("🔍 ATT: Requesting permission...");
        const { status } = await requestTrackingPermissionsAsync();
        console.log("📋 ATT result:", status);

        if (status === PermissionStatus.GRANTED) {
          console.log("✅ ATT granted, initializing tracking SDKs");
          await onGranted();
        } else {
          console.log("❌ ATT not granted");
        }
      } catch (error) {
        console.error("❌ ATT request failed:", error);
      }
    })();
  }, [onGranted]);
}
