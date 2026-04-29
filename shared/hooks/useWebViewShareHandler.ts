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

      // iOS 와 Android 의 Share.share 동작이 다르다.
      // iOS 는 message / url 을 *서로 다른 activity item* 으로 전달하므로
      // 둘 다 채우면 받는 쪽에서 두 개 (텍스트 + 카드) 로 보인다.
      // 그래서 플랫폼별로 한 슬롯만 사용한다.
      const shareOptions = Platform.select({
        ios: { url },
        default: { message: url },
      });

      const result = await Share.share(shareOptions!);

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
