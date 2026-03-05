import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Image,
} from "react-native";
import { WebView } from "react-native-webview";
import { getWebViewBaseUrl } from "../../../shared/lib/getWebViewBaseUrl";

interface NotificationSnackbarProps {
  visible: boolean;
  title: string;
  body: string;
  imageUrl?: string;
  targetUrl?: string;
  onPress: () => void;
  onDismiss: () => void;
  topInset: number;
  webViewRef: React.RefObject<WebView | null>;
}

export function NotificationSnackbar({
  visible,
  title,
  body,
  imageUrl,
  targetUrl,
  onPress,
  onDismiss,
  topInset,
  webViewRef,
}: NotificationSnackbarProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // 스낵바 표시 애니메이션 (위에서 아래로 슬라이드 다운)
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // 스낵바 숨김 애니메이션 (위로 슬라이드 업)
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, opacity]);

  const handlePress = () => {
    if (targetUrl && webViewRef.current) {
      const fullUrl = `${getWebViewBaseUrl()}${encodeURI(targetUrl)}`;
      webViewRef.current.injectJavaScript(
        `window.location.href="${fullUrl}";true;`
      );
    }
    onPress();
    onDismiss();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: topInset + 60,
          transform: [{ translateY }],
          opacity,
        },
      ]}
      pointerEvents={visible ? "auto" : "none"}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        style={styles.touchable}
      >
        <View style={styles.content}>
          {/* 왼쪽: 썸네일 이미지 */}
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Text style={styles.placeholderIcon}>🏥</Text>
            </View>
          )}

          {/* 중간: 텍스트 영역 */}
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.body} numberOfLines={2}>
              {body}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
  },
  touchable: {
    width: "100%",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DEF1FF",
    borderRadius: 12,
    padding: 12,
    ...Platform.select({
      ios: {
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0, 0, 0, 0.1)",
      },
    }),
  },
  thumbnail: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    marginRight: 12,
  },
  thumbnailPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  placeholderIcon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: "500",
    color: "#737373",
    lineHeight: 16,
    marginBottom: 2,
  },
  body: {
    fontSize: 14,
    fontWeight: "700",
    color: "#171717",
    lineHeight: 20,
  },
});
