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
              height: 40, // ✅ This works!
              backgroundColor: "rgba(246, 245, 240, 1)",
            }}
          />
        ),
        // headerTintColor: "#ffffff",
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
