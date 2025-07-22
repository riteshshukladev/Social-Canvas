// components/DeleteCatalogModal.tsx
import React from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

interface DeleteCatalogModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  catalogName: string;
  loading: boolean;
}

export const DeleteCatalogModal: React.FC<DeleteCatalogModalProps> = ({
  visible,
  onClose,
  onConfirm,
  catalogName,
  loading,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/50 justify-center items-center"
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View className="bg-white rounded-2xl p-6 mx-6 min-w-[300px]">
            {/* Header */}
            <View className="items-center mb-4">
              <Text className="text-xl font-bold text-red-600 mb-2">
                Delete Catalog
              </Text>
              <Text className="text-center text-gray-600">
                Are you sure you want to delete "{catalogName}"?
              </Text>
              <Text className="text-center text-gray-500 text-sm mt-2">
                This action cannot be undone.
              </Text>
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
                onPress={onConfirm}
                disabled={loading}
                className={`flex-1 py-3 rounded-lg items-center ${
                  loading ? "bg-red-400" : "bg-red-600"
                }`}
              >
                <Text className="text-white font-medium">
                  {loading ? "Deleting..." : "Delete"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
