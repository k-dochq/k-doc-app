import React from "react";
import { View, StyleSheet } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import Constants from "expo-constants";
import { handleShouldStartLoadWithRequest } from "../../../shared/lib";
import { useWebViewBackHandler } from "../../../shared/hooks";
import { useWebViewState } from "../model/useWebViewState";

interface WebViewContainerProps {
  webViewRef: React.RefObject<WebView | null>;
  onMessage: (event: WebViewMessageEvent) => void;
  initialUrl: string;
}

export function WebViewContainer({
  webViewRef,
  onMessage,
  initialUrl,
}: WebViewContainerProps) {
  const { setWebViewReady } = useWebViewState();

  const { handleNavigationStateChange } = useWebViewBackHandler(webViewRef);

  const handleLoadEnd = () => {
    setWebViewReady();
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        style={styles.webview}
        source={{ uri: initialUrl }}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadEnd={handleLoadEnd}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        onMessage={onMessage}
        allowsBackForwardNavigationGestures={true}
        // Pull-to-Refresh 설정
        pullToRefreshEnabled={true}
        bounces={true}
        scrollEnabled={true}
        // 웹뷰 메시지 통신을 위한 설정
        javaScriptEnabled={true}
        domStorageEnabled={true}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        // 캐싱 설정
        cacheEnabled={true}
        cacheMode="LOAD_CACHE_ELSE_NETWORK"
        incognito={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
  webview: {
    flex: 1,
  },
});
