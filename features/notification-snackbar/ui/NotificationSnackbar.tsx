import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
} from "react-native";
import Svg, { Path } from "react-native-svg";
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
          {/* 병원 프로필 이미지 */}
          <View style={styles.profileCircle}>
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : null}
          </View>

          {/* 텍스트 */}
          <View style={styles.textContainer}>
            <Text style={styles.hospitalName} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.message} numberOfLines={2}>
              {body}
            </Text>
          </View>

          {/* 화살표 */}
          <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
            <Path
              d="M7.5 4.16406L13.3333 9.9974L7.5 15.8307"
              stroke="#E5E5E5"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
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
    backgroundColor: "#a3a3a3",
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  profileCircle: {
    width: 46,
    height: 46,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#001872",
    flexShrink: 0,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  hospitalName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#e5e5e5",
    lineHeight: 19,
  },
  message: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    lineHeight: 24,
  },
});
