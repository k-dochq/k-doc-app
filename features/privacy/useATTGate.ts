import { useEffect, useRef } from "react";
import {
  requestTrackingPermissionsAsync,
  getTrackingPermissionsAsync,
  PermissionStatus,
} from "expo-tracking-transparency";

/**
 * 첫 실행 시 ATT 동의 요청을 띄우고, 허용일 때만 onGranted() 호출.
 * 이미 결정된 상태면 요청 없이 바로 분기.
 * 반드시 앱이 active 상태일 때 호출되어야 합니다(앱 시작 직후).
 */
export function useATTGate(onGranted: () => Promise<void> | void) {
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    (async () => {
      try {
        // 1) 현재 ATT 상태 확인
        const { status } = await getTrackingPermissionsAsync();

        // 2) 아직 미결정이면 시스템 팝업 요청
        if (status === PermissionStatus.UNDETERMINED) {
          const result = await requestTrackingPermissionsAsync();

          // 3) 허용된 경우에만 추적 SDK 초기화
          if (result.status === PermissionStatus.GRANTED) {
            await onGranted();
          } else {
            console.log("ATT not granted -> skip initializing tracking SDKs");
          }
        } else if (status === PermissionStatus.GRANTED) {
          // 이미 허용된 경우 바로 초기화
          await onGranted();
        } else {
          // 거부/제한된 경우
          console.log("ATT denied or restricted -> skip tracking SDKs");
        }
      } catch (error) {
        console.error("ATT permission check failed:", error);
      }
    })();
  }, [onGranted]);
}
