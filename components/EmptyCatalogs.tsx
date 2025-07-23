// components/EmptyCatalogs.tsx
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface EmptyCatalogsProps {
  name: string;
  onCreateCatalog: () => void;
}

const EmptyCatalogs = ({ name, onCreateCatalog }: EmptyCatalogsProps) => {
  return (
    <View className="flex-1 items-center w-full h-full bg-secondary  justify-center">
      <View className="flex-1 items-center justify-center px-4">
        <Text className="text-center text-lg font-sftbold mb-2">
          {name}, looks like you don't have a catalog?
        </Text>
        <Text className="text-center text-base font-sftmedium text-gray-600">
          Create one and let's connect stories.
        </Text>
      </View>
      <View className="w-full px-6 pb-8">
        <TouchableOpacity
          onPress={onCreateCatalog}
          className="bg-transparent border border-black py-3 rounded-lg items-center w-full"
        >
          <Text className="text-black font-medium font-sftmedium text-sm">
            Create Catalog
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Add displayName
EmptyCatalogs.displayName = "EmptyCatalogs";

export default EmptyCatalogs;
