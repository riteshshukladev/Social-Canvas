import { BlurView } from "expo-blur";
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
        {/* Replace the Pressable with BlurView */}
        <BlurView intensity={0} style={{ flex: 1 }} tint="dark">
          <Pressable className="flex-1" onPress={onClose}>
            <View className="flex-1 justify-end">
              <Pressable onPress={(e) => e.stopPropagation()}>
                <View className="bg-secondary rounded-t-3xl py-8 px-12 min-h-fit">
                  {/* Form */}
                  <View className="gap-2">
                    <View>
                      {/* <Text className="text-base font-medium mb-2">
                        Catalog Name
                      </Text> */}
                      <TextInput
                        className="border border-black rounded-lg p-3 text-base text-black placeholder:text-black font-sftlight tracking-wide"
                        placeholder="Enter catalog name"
                        value={catalogName}
                        onChangeText={setCatalogName}
                        autoFocus
                      />
                    </View>

                    {/* Buttons */}
                    <View className="flex-row gap-4 mt-6 px-4">
                      <TouchableOpacity
                        onPress={onClose}
                        className="flex-1 bg-transparent border border-black py-3 rounded-lg items-center"
                      >
                        <Text className="text-black font-medium font-sftmedium text-sm">
                          Cancel
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={onSubmit}
                        disabled={loading || !catalogName.trim()}
                        className={`flex-1 bg-transparent border border-black py-3 rounded-lg items-center text-black `}
                      >
                        <Text className="text-black font-medium font-sftmedium text-sm">
                          {loading ? "Creating..." : "Create Catalog"}
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
