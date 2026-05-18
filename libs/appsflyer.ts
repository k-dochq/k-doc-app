import appsFlyer from "react-native-appsflyer";
import Constants from "expo-constants";
import { DeviceEventEmitter } from "react-native";

const { devKey, iosAppId } = Constants.expoConfig?.extra?.appsFlyer || {};

export const APPSFLYER_DEEP_LINK_EVENT = "appsflyer:deeplink";

export async function initAppsFlyer(): Promise<void> {
  // initSdk 직전에 등록 — "before initSdk" 요건 충족하면서 native bridge 준비 완료 시점에 실행
  appsFlyer.onDeepLinkCallback((res) => {
    if (res.status === "FOUND") {
      console.log(
        `📡 AppsFlyer UDL: ${res.data?.is_deferred ? "deferred" : "direct"} deep link`
      );
      DeviceEventEmitter.emit(APPSFLYER_DEEP_LINK_EVENT, res.data ?? {});
    }
  });

  return new Promise((resolve, reject) => {
    appsFlyer.initSdk(
      {
        devKey,
        appId: iosAppId,
        isDebug: __DEV__,
        onDeepLinkListener: true,
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
