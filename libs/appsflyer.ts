// libs/appsflyer.ts
import appsFlyer from "react-native-appsflyer";
import Constants from "expo-constants";

const { devKey, iosAppId } = Constants.expoConfig?.extra?.appsFlyer || {};

export async function initAppsFlyer() {
  return new Promise<void>((resolve, reject) => {
    appsFlyer.initSdk(
      {
        devKey,
        appId: iosAppId, // iOS 전용 — Android에선 무시됨
        isDebug: __DEV__, // 개발 중엔 로그 보기 편하게 true
      },
      (result) => {
        console.log("📡 AppsFlyer SDK initialized", result);
        resolve();
      },
      (error) => {
        console.error("❌ AppsFlyer SDK init failed", error);
        reject(error);
      }
    );
  });
}
