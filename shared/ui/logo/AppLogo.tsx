import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface AppLogoProps {
  size?: "small" | "medium" | "large";
}

export function AppLogo({ size = "large" }: AppLogoProps) {
  const logoSize = size === "small" ? 40 : size === "medium" ? 60 : 80;

  return (
    <View style={styles.container}>
      <View style={[styles.logo, { width: logoSize, height: logoSize }]}>
        <Text style={[styles.logoText, { fontSize: logoSize * 0.4 }]}>K</Text>
      </View>
      <Text style={styles.appName}>K-DOC</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    backgroundColor: "#FFDBF9",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoText: {
    color: "#333",
    fontWeight: "bold",
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    letterSpacing: 1,
  },
});
