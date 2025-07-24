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

interface LogoutModalProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({
  visible,
  onClose,
  onLogout,
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
        {/* Increased BlurView intensity for better visibility */}
        <BlurView intensity={0} style={{ flex: 1 }} tint="dark">
          <Pressable className="flex-1" onPress={onClose}>
            <View className="flex-1 justify-end">
              <Pressable onPress={(e) => e.stopPropagation()}>
                <View className="bg-secondary rounded-t-3xl py-8 px-12 min-h-fit">
                  {/* Content */}
                  <View className="gap-2">
                    {/* Logout confirmation message */}
                    <View>
                      <Text className="text-center text-black text-base font-sftbold tracking-wide mb-2">
                        sure you want to Sign out?
                      </Text>
                    </View>

                    <View className="mt-6 px-4 gap-3">
                      {/* Logout Button */}
                      <TouchableOpacity
                        onPress={onLogout}
                        className="bg-transparent border border-red-400 py-3 rounded-lg items-center"
                      >
                        <Text className="text-black font-medium font-sftmedium text-sm">
                          Log Out
                        </Text>
                      </TouchableOpacity>

                      {/* Cancel Button */}
                      <TouchableOpacity
                        onPress={onClose}
                        className="bg-transparent border border-black py-3 rounded-lg items-center"
                      >
                        <Text className="text-black font-medium font-sftmedium text-sm">
                          Cancel
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

export default LogoutModal;
