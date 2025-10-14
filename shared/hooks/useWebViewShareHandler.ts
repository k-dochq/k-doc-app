import { WebView } from "react-native-webview";
import { Share, Platform } from "react-native";
import type { WebViewShareRequest } from "../types/webview-messages";

export function useWebViewShareHandler(
  webViewRef: React.RefObject<WebView | null>
) {
  const handleWebViewMessage = async (event: any) => {
    try {
      const data: WebViewShareRequest = JSON.parse(event.nativeEvent.data);

      if (data.type === "SHARE_REQUEST") {
        await handleShareRequest(data);
      }
    } catch (err) {
      console.warn("웹뷰 공유 메시지 파싱 에러:", err);
    }
  };

  const handleShareRequest = async (message: WebViewShareRequest) => {
    try {
      const { url } = message;

      // React Native Share API 사용 - message와 url 옵션 모두 사용
      const shareOptions = {
        message: url, // 텍스트로 URL 공유
        url: url, // 링크로 URL 공유
      };

      const result = await Share.share(shareOptions);

      if (result.action === Share.sharedAction) {
        console.log("✅ 공유 완료:", { url, platform: Platform.OS });
      } else if (result.action === Share.dismissedAction) {
        console.log("공유 취소됨");
      }
    } catch (error) {
      console.error("공유 처리 중 오류:", error);
    }
  };

  return {
    handleWebViewMessage,
  };
}
