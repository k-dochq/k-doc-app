import { useEffect, useState, useCallback } from "react";
import { Alert, Linking, AppState, AppStateStatus } from "react-native";
import * as Application from "expo-application";
import { getCurrentPlatformPolicy } from "../../../shared/lib/versionPolicyService";
import {
  isUpdateRequired,
  isUpdateRecommended,
} from "../../../shared/lib/version-utils";

interface ForceUpdateState {
  isRequired: boolean;
  message: string;
  storeUrl: string;
}

/**
 * 강제 업데이트 체크 훅
 * AppState를 모니터링하여 앱이 포그라운드로 돌아올 때마다 버전을 재확인
 */
export function useForceUpdateCheck() {
  const [forceUpdateState, setForceUpdateState] = useState<ForceUpdateState>({
    isRequired: false,
    message: "",
    storeUrl: "",
  });

  const checkVersion = useCallback(async () => {
    try {
      // 현재 앱 버전 가져오기
      const currentVersion = Application.nativeApplicationVersion ?? "0.0.0";
      console.log("📱 현재 앱 버전:", currentVersion);

      // 서버에서 버전 정책 가져오기
      const policy = await getCurrentPlatformPolicy();
      if (!policy) {
        console.warn(
          "⚠️ 버전 정책을 가져올 수 없습니다. 버전 체크를 건너뜁니다."
        );
        return;
      }

      console.log("📋 버전 정책:", policy);

      // 강제 업데이트가 필요한 경우
      if (isUpdateRequired(currentVersion, policy.minSupportedVersion)) {
        console.log("🚨 강제 업데이트 필요");
        setForceUpdateState({
          isRequired: true,
          message:
            policy.message ||
            "Please update to the latest version to continue using the app.",
          storeUrl: policy.storeUrl,
        });
      }
      // 권장 업데이트가 있는 경우 (강제 업데이트가 아닌 경우에만)
      else if (isUpdateRecommended(currentVersion, policy.latestVersion)) {
        console.log("💡 권장 업데이트 있음");
        const alertTitle = "Update Available";
        const alertMessage =
          policy.message ||
          "A new version is available. Would you like to update now?";

        Alert.alert(alertTitle, alertMessage, [
          {
            text: "Later",
            style: "cancel",
          },
          {
            text: "Update",
            onPress: () => {
              console.log("🔗 스토어로 이동:", policy.storeUrl);
              Linking.openURL(policy.storeUrl);
            },
          },
        ]);
      } else {
        console.log("✅ 앱이 최신 버전입니다.");
        // 강제 업데이트가 필요하지 않으면 상태 초기화
        setForceUpdateState({
          isRequired: false,
          message: "",
          storeUrl: "",
        });
      }
    } catch (error) {
      console.error("❌ 버전 체크 중 오류 발생:", error);
    }
  }, []);

  const handleUpdatePress = useCallback(() => {
    console.log("🔗 스토어로 이동:", forceUpdateState.storeUrl);
    Linking.openURL(forceUpdateState.storeUrl);
  }, [forceUpdateState.storeUrl]);

  useEffect(() => {
    // 앱 시작 시 버전 체크 실행
    checkVersion();

    // AppState 리스너 등록
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        console.log("🔄 앱이 포그라운드로 복귀 - 버전 재확인");
        checkVersion();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // 클린업
    return () => {
      subscription?.remove();
    };
  }, [checkVersion]);

  return {
    forceUpdateRequired: forceUpdateState.isRequired,
    updateMessage: forceUpdateState.message,
    storeUrl: forceUpdateState.storeUrl,
    onUpdatePress: handleUpdatePress,
  };
}
