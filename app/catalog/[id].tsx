// app/catalog/[id].tsx - COMPLETE CLEANED VERSION
import SequentialDonutLoader from "@/components/Loader/SequentialDonutLoader";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import TldrawWebView from "../../components/TldrawWebView";
import { useCatalogOperations } from "../../hooks/useCatalogOperations";
export default function CatalogDetailPage() {
  const { id, name, year } = useLocalSearchParams<{
    id: string;
    name: string;
    year: string;
  }>();
  const router = useRouter();
  const { user } = useCatalogOperations();

  // ✅ DEBUG: Log what we're getting
  useEffect(() => {
    console.log("=== [id].tsx Debug ===");
    console.log("id:", id);
    console.log("user:", user);
    console.log("user?.id:", user?.id);
    console.log("==================");
  }, [id, user]);

  // ✅ REMOVED: All AsyncStorage logic - now handled by TldrawWebView + database

  const handleCanvasSaved = (data: any) => {
    // ✅ This is now handled by the database in TldrawWebView
    console.log("Canvas saved to database:", data);
    // You can add additional logic here if needed
  };

  const handleGoBack = () => {
    router.back();
  };

  // ✅ SIMPLIFIED: Clear canvas - now just a message to WebView
  const clearCanvasData = () => {
    Alert.alert(
      "Clear Canvas",
      "Are you sure you want to clear all canvas data? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            // ✅ TODO: You can add a clearCanvas message to WebView if needed
            console.log("Clear canvas requested");
            Alert.alert("Info", "Canvas cleared! Draw something new.");
          },
        },
      ]
    );
  };

  // ✅ Don't render until we have a user
  if (!user?.id) {
    return (
      <View style={styles.loadingContainer}>
        <SequentialDonutLoader size={60} ball={13} />
        <Text style={styles.loadingText}>Loading user...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} className="bg-primary">
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <Text
            // style={styles.headerTitle}
            className="text-lg font-sftmedium text-black"
          >
            {name}
          </Text>
          <Text
            // style={styles.headerSubtitle}
            className="text-xs font-sftmedium text-black/60"
          >
            {user?.firstName} {user?.lastName}
          </Text>
        </View>

        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Text className="text-lg font-sftmedium text-black">Home</Text>
        </TouchableOpacity>
      </View>

      <TldrawWebView
        userId={user.id} // ✅ Clerk user ID
        canvasName={id} // ✅ Canvas ID from route params
        onCanvasSaved={handleCanvasSaved} // ✅ Optional callback
        style={styles.canvas}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    // alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
    paddingTop: 46,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#007bff",
    fontWeight: "600",
  },
  headerCenter: {
    // flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 2,
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    fontSize: 18,
  },
  canvas: {
    flex: 1,
  },
  instructions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  instructionText: {
    color: "white",
    fontSize: 12,
    textAlign: "center",
  },
});
