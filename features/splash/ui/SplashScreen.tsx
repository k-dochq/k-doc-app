import { ImageBackground, StyleSheet } from "react-native";

interface SplashScreenProps {
  source: any;
}

export function SplashScreen({ source }: SplashScreenProps) {
  return (
    <ImageBackground
      source={source}
      style={styles.splashBackground}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  splashBackground: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});
