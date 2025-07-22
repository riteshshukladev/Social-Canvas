import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface CreateCatalogOverlayProps {
  visible: boolean;
  onClose: () => void;
  catalogName: string;
  setCatalogName: (name: string) => void;
  catalogYear: string;
  setCatalogYear: (year: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

export const CreateCatalogOverlay: React.FC<CreateCatalogOverlayProps> = ({
  visible,
  onClose,
  catalogName,
  setCatalogName,
  catalogYear,
  setCatalogYear,
  onSubmit,
  loading,
}) => {
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
        <Pressable className="flex-1 bg-black/50" onPress={onClose}>
          <View className="flex-1 justify-end">
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View className="bg-white rounded-t-3xl p-6 min-h-[300px]">
                {/* Header */}
                <View className="flex-row justify-between items-center mb-6">
                  <Text className="text-xl font-bold">Create New Catalog</Text>
                  <TouchableOpacity
                    onPress={onClose}
                    className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center"
                  >
                    <Text className="text-gray-600 font-bold">×</Text>
                  </TouchableOpacity>
                </View>

                {/* Form */}
                <View className="gap-4">
                  <View>
                    <Text className="text-base font-medium mb-2">
                      Catalog Name
                    </Text>
                    <TextInput
                      className="border border-gray-300 rounded-lg p-3 text-base"
                      placeholder="Enter catalog name"
                      value={catalogName}
                      onChangeText={setCatalogName}
                      autoFocus
                    />
                  </View>

                  <View>
                    <Text className="text-base font-medium mb-2">Year</Text>
                    <TextInput
                      className="border border-gray-300 rounded-lg p-3 text-base"
                      placeholder="e.g., 2024"
                      value={catalogYear}
                      onChangeText={setCatalogYear}
                      keyboardType="numeric"
                    />
                  </View>

                  {/* Buttons */}
                  <View className="flex-row gap-3 mt-6">
                    <TouchableOpacity
                      onPress={onClose}
                      className="flex-1 bg-gray-200 py-3 rounded-lg items-center"
                    >
                      <Text className="text-gray-800 font-medium">Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={onSubmit}
                      disabled={loading || !catalogName.trim()}
                      className={`flex-1 py-3 rounded-lg items-center ${
                        loading || !catalogName.trim()
                          ? "bg-gray-400"
                          : "bg-blue-600"
                      }`}
                    >
                      <Text className="text-white font-medium">
                        {loading ? "Creating..." : "Create Catalog"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};
