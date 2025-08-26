// app/(screen)/_layout.tsx
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
              height: 40,
              backgroundColor: "rgba(246, 245, 240, 1)",
            }}
          />
        ),
      }}
    >
      <Stack.Screen
        name="profile"
        options={{
          title: "",
        }}
      />
      {/* ✅ Add this for your catalog directory */}
      <Stack.Screen
        name="catalog"
        options={{
          title: "",
          headerShown: false, // Let the catalog handle its own header
        }}
      />
    </Stack>
  );
}
