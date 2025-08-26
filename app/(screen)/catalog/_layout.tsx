// app/(screen)/catalog/_layout.tsx
import { Stack } from "expo-router";

export default function CatalogScreenLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // HomePage handles its own header/styling
      }}
    >
      <Stack.Screen
        name="HomePage"
        options={{
          title: "",
        }}
      />
    </Stack>
  );
}
