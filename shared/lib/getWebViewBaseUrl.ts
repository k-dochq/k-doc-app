import * as Device from "expo-device";
import { Platform } from "react-native";
import { WEBVIEW_URL, WEBVIEW_URL_IPAD } from "../../constants/urls";

/**
 * 아이패드(iOS + 태블릿)일 때만 WEBVIEW_URL_IPAD, 그 외(iPhone, Android 전부)는 WEBVIEW_URL.
 */
export function getWebViewBaseUrl(): string {
  const isIpad =
    Platform.OS === "ios" &&
    Device.deviceType === Device.DeviceType.TABLET;
  return isIpad ? WEBVIEW_URL_IPAD : WEBVIEW_URL;
}
