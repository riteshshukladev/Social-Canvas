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

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // const [loaded] = useFonts({
  //   SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  // });

  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <InitialLayout />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ClerkProvider>
  );
}

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null; 
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isSignedIn ? (
        <>
          <Stack.Screen name="(screen)/profile" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </>
      ) : (
        <>
          <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        </>
      )}
    </Stack>
  );
}
