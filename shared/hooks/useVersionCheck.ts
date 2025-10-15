/**
 * 앱 버전 체크 훅
 * 앱 시작 시 서버의 버전 정책과 현재 앱 버전을 비교하여 업데이트 유도
 */

import { useEffect } from "react";
import { Alert, Linking, Platform } from "react-native";
import * as Application from "expo-application";
import { getCurrentPlatformPolicy } from "../lib/versionPolicyService";
import { isUpdateRequired, isUpdateRecommended } from "../lib/version-utils";

/**
 * 버전 체크를 수행하는 커스텀 훅
 * 앱 시작 시 한 번만 실행되며, 업데이트가 필요한 경우 사용자에게 알림
 */
export function useVersionCheck() {
  useEffect(() => {
    const checkVersion = async () => {
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
          const alertTitle = "Update Required";
          const alertMessage =
            policy.message ||
            "Please update to the latest version to continue using the app.";

          Alert.alert(
            alertTitle,
            alertMessage,
            [
              {
                text: "Update",
                onPress: () => {
                  console.log("🔗 스토어로 이동:", policy.storeUrl);
                  Linking.openURL(policy.storeUrl);
                },
              },
            ],
            {
              cancelable: !policy.forceOn, // forceOn이 true면 취소 불가
            }
          );
        }
        // 권장 업데이트가 있는 경우 (강제 업데이트가 아닌 경우에만)
        else if (isUpdateRecommended(currentVersion, policy.latestVersion)) {
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
        }
      } catch (error) {
        console.error("❌ 버전 체크 중 오류 발생:", error);
      }
    };

    // 앱 시작 시 버전 체크 실행
    checkVersion();
  }, []); // 빈 의존성 배열로 앱 시작 시 한 번만 실행
}
