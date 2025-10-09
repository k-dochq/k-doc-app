// React Native WebView에서 받는 메시지 타입 정의
export interface LoginSuccessMessage {
  type: "LOGIN_SUCCESS";
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email?: string;
    display_name?: string;
  };
}

export type WebViewMessage = LoginSuccessMessage;
