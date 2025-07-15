import { styles } from "@/styles/authstyles";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface SSOButtonsProps {
  handleSSOAuth: (strategy: string) => void;
}

export const SSOButtons: React.FC<SSOButtonsProps> = ({ handleSSOAuth }) => {
  return (
    <>
      <View className="flex flex-row items-center justify-center my-8">
        <View className="flex-1 h-[.8] bg-gray-300 opacity-60" />
        <Text className="mx-3 text-sm text-white opacity-50">OR</Text>
        <View className="flex-1 h-[.8] bg-gray-300 opacity-60" />
      </View>

      <View className="w-full gap-4">
        <TouchableOpacity
          style={styles.ssoButton}
          onPress={() => handleSSOAuth("oauth_google")}
        >
          <Text style={styles.ssoButtonText}>Single Sign On (SSO)</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};
