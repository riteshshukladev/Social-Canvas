// components/EmptyCatalogs.tsx
import { BlurView } from "expo-blur";
import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface EmptyCatalogsProps {
  name: string;
  visible: boolean;
  onClose: () => void;
  onCreateCatalog: () => void;
}

const EmptyCatalogs = ({
  name,
  visible,
  onClose,
  onCreateCatalog,
}: EmptyCatalogsProps) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <BlurView intensity={0} style={{ flex: 1 }} tint="dark">
          <Pressable className="flex-1" onPress={onClose}>
            <View className="flex-1 justify-end items-center">
              <Pressable onPress={(e) => e.stopPropagation()}>
                <View className="bg-secondary rounded-3xl px-8 py-12 min-h-[90%] w-full">
                  {/* Content */}
                  <View className="flex-1 items-center justify-center">
                    <Text className="text-center text-lg font-sftbold mb-4">
                      {name}, looks like you don't have a catalog?
                    </Text>
                    <Text className="text-center text-base font-sftmedium text-gray-600 mb-8">
                      Create one and let's connect stories.
                    </Text>

                    {/* Button centered with content */}
                    <TouchableOpacity
                      onPress={onCreateCatalog}
                      className="bg-transparent border border-black py-3 px-8 rounded-lg items-center"
                    >
                      <Text className="text-black font-medium font-sftmedium text-sm text-center">
                        Create Catalog
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Pressable>
            </View>
          </Pressable>
        </BlurView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// Add displayName
EmptyCatalogs.displayName = "EmptyCatalogs";

export default EmptyCatalogs;
