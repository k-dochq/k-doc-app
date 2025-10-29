import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Sentry from "@sentry/react-native";
import { RootNavigator } from "./features/navigation/RootNavigator";

// Sentry 초기화
Sentry.init({
  dsn: "https://4fde45e54533ab79b9a06e91f7ba1673@o4510191631466496.ingest.de.sentry.io/4510191648243792",
  // Adds more context data to events (IP address, cookies, user, etc.)
  sendDefaultPii: true,
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
  tracesSampleRate: 1.0,
  // Enable logs to be sent to Sentry
  enableLogs: true,
});

function App() {
  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
