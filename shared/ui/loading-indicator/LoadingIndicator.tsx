import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

interface LoadingIndicatorProps {
  size?: "small" | "large";
  color?: string;
}

export function LoadingIndicator({
  size = "large",
  color = "#FFDBF9",
}: LoadingIndicatorProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});
