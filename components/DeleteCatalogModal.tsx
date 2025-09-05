// components/DeleteCatalogModal.tsx
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

interface DeleteCatalogModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  catalogName: string;
  loading: boolean;
  borderChange?: string;
}

export const DeleteCatalogModal: React.FC<DeleteCatalogModalProps> = ({
  visible,
  onClose,
  onConfirm,
  catalogName,
  loading,
  borderChange,
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
        {/* Same BlurView styling as Create modal */}
        <BlurView intensity={0} style={{ flex: 1 }} tint="dark">
          <Pressable className="flex-1" onPress={onClose}>
            <View className="flex-1 justify-end">
              <Pressable onPress={(e) => e.stopPropagation()}>
                <View className="bg-secondary rounded-t-3xl py-8 px-12 min-h-fit">
                  {/* Content */}
                  <View className="gap-2">
                    {/* Delete confirmation message */}
                    <View>
                      <Text className="text-center text-black text-base font-sftbold tracking-wide mb-2">
                        Are you sure you want to delete "{catalogName}"?
                      </Text>
                      <Text className="text-center text-black text-sm font-sftmedium tracking-wide opacity-70">
                        This action cannot be undone.
                      </Text>
                    </View>

                    {/* Buttons - Same styling as Create modal */}
                    <View className="flex-row gap-4 mt-6 px-4">
                      <TouchableOpacity
                        onPress={onClose}
                        className="flex-1 bg-transparent border py-3 rounded-lg items-center"
                        style={{ borderColor: borderChange }}
                      >
                        <Text className="text-black font-medium font-sftmedium text-sm">
                          Cancel
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={onConfirm}
                        disabled={loading}
                        className="flex-1 bg-transparent border py-3 rounded-lg items-center"
                        style={{ borderColor: borderChange }}
                      >
                        <Text className="text-black font-medium font-sftmedium text-sm">
                          {loading ? "Deleting..." : "Delete"}
                        </Text>
                      </TouchableOpacity>
                    </View>
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
