// app/+not-found.tsx
import SequentialDonutLoader from "@/components/Loader/SequentialDonutLoader";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";

export default function NotFoundScreen() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => {
        if (isSignedIn) {
          router.dismissAll();
          router.push("/(screen)/profile");
        } else {
          router.dismissAll();
          router.push("/(auth)/login");
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <View style={styles.container}>
      <SequentialDonutLoader size={60} ball={13} text="...Redirecting" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666666",
  },
});
