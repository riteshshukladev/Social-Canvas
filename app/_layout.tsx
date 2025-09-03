// app/_layout.tsx
import { SupabaseProvider } from "@/components/SupabaseProvider";
import { tokenCache } from "@/utils/tokenCache";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import "react-native-get-random-values";

import SequentialDonutLoader from "@/components/Loader/SequentialDonutLoader";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler"; // ✅ Add this import
import "react-native-reanimated";
import "../styles/global.css";

function ConditionalStack() {
  const [isLoadedFont] = useFonts({
    "SFT-regular": require("../assets/fonts/SFTSchriftedSansTRIAL-Regular.ttf"),
    "SFT-medium": require("../assets/fonts/SFTSchriftedSansTRIAL-Medium.ttf"),
    "SFT-bold": require("../assets/fonts/SFTSchriftedSansTRIAL-Bold.ttf"),
    "SFT-light": require("../assets/fonts/SFTSchriftedSansTRIAL-Light.ttf"),
    "SFT-extralight": require("../assets/fonts/SFTSchriftedSansTRIAL-ExtraLight.ttf"),
    "SFT-extrabold": require("../assets/fonts/SFTSchriftedSansTRIAL-ExtraBold.ttf"),
    "SFT-demibold": require("../assets/fonts/SFTSchriftedSansTRIAL-DemiBold.ttf"),
    "SFT-black": require("../assets/fonts/SFTSchriftedSansTRIAL-Black.ttf"),
  });

  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoadedFont || !isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#ffffff",
        }}
      >
        <SequentialDonutLoader size={60} ball={13} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* ✅ Wrap the Stack in GestureHandlerRootView */}
      <SupabaseProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "none",
            animationDuration: 0,
          }}
        >
          {isSignedIn ? (
            <Stack.Screen
              name="(screen)"
              options={{
                headerShown: false,
                animation: "none",
              }}
            />
          ) : (
            <Stack.Screen
              name="(auth)"
              options={{
                headerShown: false,
                animation: "none",
              }}
            />
          )}
          <Stack.Screen
            name="+not-found"
            options={{
              headerShown: false,
              presentation: "modal",
              animation: "none",
            }}
          />
        </Stack>
      </SupabaseProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <ConditionalStack />
        <StatusBar style="auto" />
      </ThemeProvider>
    </ClerkProvider>
  );
}
