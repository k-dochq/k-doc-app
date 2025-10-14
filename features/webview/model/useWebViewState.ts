import { useState } from "react";

export interface WebViewState {
  isWebViewReady: boolean;
}

export function useWebViewState() {
  const [state, setState] = useState<WebViewState>({
    isWebViewReady: false,
  });

  const setWebViewReady = () => {
    setState((prev) => ({
      ...prev,
      isWebViewReady: true,
    }));
  };

  return {
    ...state,
    setWebViewReady,
  };
}
