// app/catalog/_layout.tsx
import { Stack } from "expo-router";
// Remove GestureHandlerRootView import

export default function CatalogLayout() {
  return (
    // ✅ Remove GestureHandlerRootView wrapper
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          title: "",
        }}
      />
    </Stack>
  );
}
