import { useState, useCallback, useRef, useEffect } from "react";
import * as Notifications from "expo-notifications";

interface NotificationSnackbarState {
  visible: boolean;
  title: string;
  body: string;
  targetUrl?: string;
}

// const AUTO_DISMISS_DURATION = 5000; // 5초
const AUTO_DISMISS_DURATION = 5000000000000; // 5초

export function useNotificationSnackbar() {
  const [state, setState] = useState<NotificationSnackbarState>({
    visible: false,
    title: "",
    body: "",
    targetUrl: undefined,
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 기존 타이머 정리
  const clearExistingTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // 스낵바 표시
  const showSnackbar = useCallback(
    (notification: Notifications.Notification) => {
      // 기존 타이머 정리
      clearExistingTimeout();

      // 알림 데이터 추출
      const title = notification.request.content.title || "";
      const body = notification.request.content.body || "";
      const targetUrl = notification.request.content.data?.targetUrl as
        | string
        | undefined;

      // 스낵바 표시 (최신 알림으로 덮어쓰기)
      setState({
        visible: true,
        title,
        body,
        targetUrl,
      });

      // 5초 후 자동 닫기
      timeoutRef.current = setTimeout(() => {
        setState((prev) => ({ ...prev, visible: false }));
        timeoutRef.current = null;
      }, AUTO_DISMISS_DURATION);
    },
    [clearExistingTimeout]
  );

  // 스낵바 숨김
  const hideSnackbar = useCallback(() => {
    clearExistingTimeout();
    setState((prev) => ({ ...prev, visible: false }));
  }, [clearExistingTimeout]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      clearExistingTimeout();
    };
  }, [clearExistingTimeout]);

  return {
    visible: state.visible,
    title: state.title,
    body: state.body,
    targetUrl: state.targetUrl,
    showSnackbar,
    hideSnackbar,
  };
}
