import React from "react";
import { ImageBackground, StyleSheet, Animated, View } from "react-native";
import { LoadingIndicator } from "../../../shared/ui/loading-indicator/LoadingIndicator";

interface SplashScreenProps {
  fadeAnim: Animated.Value;
  showLoadingIndicator?: boolean;
}

export function SplashScreen({
  fadeAnim,
  showLoadingIndicator = false,
}: SplashScreenProps) {
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ImageBackground
        source={require("../../../assets/images/splash.png")}
        style={styles.imageBackground}
        resizeMode="contain"
      />
      {showLoadingIndicator && (
        <View style={styles.loadingOverlay}>
          <LoadingIndicator />
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  imageBackground: {
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)", // 약간의 반투명 오버레이
  },
});
