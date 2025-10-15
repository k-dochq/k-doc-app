import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Modal,
} from "react-native";

interface ForceUpdateScreenProps {
  message: string;
  storeUrl: string;
  onUpdatePress: () => void;
}

export function ForceUpdateScreen({
  message,
  storeUrl,
  onUpdatePress,
}: ForceUpdateScreenProps) {
  return (
    <Modal
      visible={true}
      transparent={false}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View style={styles.container}>
        <ImageBackground
          source={require("../../../assets/images/splash.png")}
          style={styles.imageBackground}
          resizeMode="cover"
        />

        <View style={styles.contentOverlay}>
          <View style={styles.messageContainer}>
            <Text style={styles.title}>Update Required</Text>
            <Text style={styles.message}>{message}</Text>

            <TouchableOpacity
              style={styles.updateButton}
              onPress={onUpdatePress}
              activeOpacity={0.8}
            >
              <Text style={styles.updateButtonText}>Update Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageBackground: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  contentOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)", // 반투명 오버레이
  },
  messageContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 32,
    marginHorizontal: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  updateButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 160,
  },
  updateButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});
