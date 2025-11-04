import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { WebView } from "react-native-webview";
import { WEBVIEW_URL } from "../../../constants/urls";

interface NotificationSnackbarProps {
  visible: boolean;
  title: string;
  body: string;
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
      const fullUrl = `${WEBVIEW_URL}${encodeURI(targetUrl)}`;
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
          top: topInset,
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
          <Text style={styles.icon}>💬</Text>
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
    paddingTop: 8,
    paddingBottom: 12,
  },
  touchable: {
    width: "100%",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD9FB",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    ...Platform.select({
      ios: {
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0, 0, 0, 0.1)",
      },
    }),
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  body: {
    fontSize: 12,
    color: "#333",
    lineHeight: 16,
  },
});
