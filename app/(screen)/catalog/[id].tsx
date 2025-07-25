import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
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

  const handleGoBack = () => {
    router.back();
  };

  return (
    <ScrollView style={styles.container} className="bg-primary">
      {/* Header */}
      <View className="flex flex-row justify-between items-center px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={handleGoBack}>
          <Text className="text-lg font-sftmedium text-blue-600">← Back</Text>
        </TouchableOpacity>
        <Text className="text-lg font-sftbold">Catalog Details</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Catalog Info */}
      <View className="px-4 py-6">
        {/* <Text className="text-xl font-sftbold mb-2">Welcome {username}!</Text> */}
        <Text className="text-2xl font-sftbold mb-2">{name}</Text>
        <Text className="text-lg font-sftmedium text-gray-600 mb-4">
          Created: {year}
        </Text>
        <Text className="text-sm text-gray-500 mb-6">Catalog ID: {id}</Text>

        {/* Content Area */}
        <View className="bg-white rounded-lg p-4 shadow-sm">
          <Text className="text-lg font-sftmedium mb-3">Catalog Content</Text>
          <Text className="text-base text-gray-700">
            This is the detail page for "{name}" catalog.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
