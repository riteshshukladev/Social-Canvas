import TldrawWebView from "@/components/TldrawWebView";
import { useCatalogOperations } from "@/hooks/useCatalogOperations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CatalogDetailPage() {
  const { id, name, year } = useLocalSearchParams<{
    id: string;
    name: string;
    year: string;
  }>();

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [canvasData, setCanvasData] = useState(null);
  const mountedRef = useRef(false);

  const { user } = useCatalogOperations();
  // Load saved canvas data on mount
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      loadCanvasData();
    }
  }, [id]);

  const loadCanvasData = async () => {
    try {
      setLoading(true);
      const savedData = await AsyncStorage.getItem(`canvas_${id}`);
      if (savedData) {
        setCanvasData(JSON.parse(savedData));
      }
    } catch (error) {
      console.error("Error loading canvas data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCanvasSaved = async (data: any) => {
    try {
      await AsyncStorage.setItem(`canvas_${id}`, JSON.stringify(data));
      setCanvasData(data);
      console.log("Canvas data persisted");
    } catch (error) {
      console.error("Error saving canvas data:", error);
      Alert.alert("Error", "Failed to save canvas data");
    }
  };

  const handleCanvasReady = () => {
    setLoading(false);
    console.log("Canvas is ready for interaction");
  };

  const handleGoBack = () => {
    router.back();
  };

  const clearCanvasData = async () => {
    Alert.alert(
      "Clear Canvas",
      "Are you sure you want to clear all canvas data? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(`canvas_${id}`);
              setCanvasData(null);
              // Don't reload the page - just reset canvas data
              // This prevents WebView remounting and duplicate logs
            } catch (error) {
              console.error("Error clearing canvas data:", error);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading canvas...</Text>
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

      {/* Tldraw Canvas */}
      <TldrawWebView
        initialData={canvasData}
        onCanvasReady={handleCanvasReady}
        onCanvasSaved={handleCanvasSaved}
        showNativeToolbar={true}
        style={styles.canvas}
      />

      {/* Instructions */}
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
