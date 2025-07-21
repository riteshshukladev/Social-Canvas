import { Header } from "@react-navigation/elements";
import { Stack } from "expo-router";

export default function ScreenLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: ({ options }) => (
          <Header
            {...options}
            headerStyle={{
              height: 50, // ✅ This works!
              backgroundColor: "#6366f1",
            }}
          />
        ),
        headerTintColor: "#ffffff",
      }}
    >
      <Stack.Screen
        name="profile"
        options={{
          title: "",
        }}
      />
    </Stack>
  );
}
