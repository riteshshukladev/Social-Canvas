import { Stack } from "expo-router";
import { ImageBackground } from "react-native";

export default function AuthLayout() {
  return (
    <ImageBackground
      source={require("../../assets/images/main-icon/auth-bg-image.webp")}
      style={{ flex: 1 }}
      resizeMode="stretch"
    >
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "none",
          animationDuration: 0,
          contentStyle: { backgroundColor: "transparent" }, // Make stack transparent
        }}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
      </Stack>
    </ImageBackground>
  );
}
