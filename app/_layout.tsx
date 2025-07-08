import { tokenCache } from "@/utils/tokenCache";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import "react-native-reanimated";

function ConditionalStack() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    // Optionally, show a splash/loading screen here
    return null;
  }

  return (
    <Stack>
      {isSignedIn ? (
        <Stack.Screen name="(screen)" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      )}
      <Stack.Screen name="+not-found" />
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
