import { tokenCache } from "@/utils/tokenCache";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, useColorScheme, View } from "react-native";
import "react-native-reanimated";
import "../styles/global.css"; // Ensure global styles are imported

function ConditionalStack() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#ffffff",
        }}
      >
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  return (
    <Stack>
      {isSignedIn ? (
        <Stack.Screen name="(screen)" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      )}
      <Stack.Screen
        name="+not-found"
        options={{
          headerShown: false,
          presentation: "modal", // This can help with smoother transitions
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <ConditionalStack />
        <StatusBar style="auto" />
      </ThemeProvider>
    </ClerkProvider>
  );
}
