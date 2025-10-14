import { WebView } from "react-native-webview";
import { supabase } from "../lib/supabase";
import type {
  WebViewMessage,
  LoginSuccessMessage,
} from "../types/webview-message";

export function useWebViewMessageHandler(
  webViewRef: React.RefObject<WebView | null>
) {
  const handleWebViewMessage = async (event: any) => {
    try {
      const data: WebViewMessage = JSON.parse(event.nativeEvent.data);

      switch (data.type) {
        case "LOGIN_SUCCESS":
          await handleLoginSuccess(data);
          break;
        default:
          console.log("알 수 없는 메시지 타입:", data);
      }
    } catch (err) {
      console.warn("웹뷰 메시지 파싱 에러:", err);
    }
  };

  const handleLoginSuccess = async (message: LoginSuccessMessage) => {
    try {
      const { access_token, refresh_token, user } = message;

      if (!access_token || !refresh_token) {
        console.warn("❌ 토큰이 누락되었습니다");
        return;
      }

      // Supabase 세션 설정
      const { data: sessionData, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) {
        console.warn("❌ RN 세션 설정 실패:", error.message);
      } else {
        console.log("✅ RN 세션 설정 완료:", {
          userId: sessionData.user?.id,
          email: sessionData.user?.email,
        });
      }
    } catch (error) {
      console.error("로그인 성공 처리 중 오류:", error);
    }
  };

  return {
    handleWebViewMessage,
  };
}
