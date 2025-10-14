import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import Constants from "expo-constants";
import { handleShouldStartLoadWithRequest } from "../../../shared/lib";
import { useWebViewBackHandler } from "../../../shared/hooks";
import { useWebViewState } from "../model/useWebViewState";

interface WebViewContainerProps {
  webViewRef: React.RefObject<WebView | null>;
  onMessage: (event: WebViewMessageEvent) => void;
  showSplash: boolean;
  onLoadEnd: () => void;
  initialUrl: string;
}

export function WebViewContainer({
  webViewRef,
  onMessage,
  showSplash,
  onLoadEnd,
  initialUrl,
}: WebViewContainerProps) {
  const { setWebViewReady } = useWebViewState();
  const webViewFadeAnim = useRef(new Animated.Value(0)).current; // 웹뷰 페이드인 애니메이션

  const { handleNavigationStateChange } = useWebViewBackHandler(webViewRef);

  const handleLoadEnd = () => {
    setWebViewReady();
    onLoadEnd();
  };

  // 스플래시가 사라지기 시작하면 웹뷰 페이드인 시작
  useEffect(() => {
    if (!showSplash) {
      Animated.timing(webViewFadeAnim, {
        toValue: 1,
        duration: 1000, // 스플래시 페이드아웃과 동일한 시간
        useNativeDriver: true,
      }).start();
    }
  }, [showSplash, webViewFadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: webViewFadeAnim }]}>
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
    </Animated.View>
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
