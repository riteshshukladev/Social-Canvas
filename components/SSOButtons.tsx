import { styles } from "@/styles/authstyles";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface SSOButtonsProps {
  handleSSOAuth: (strategy: string) => void;
}

export const SSOButtons: React.FC<SSOButtonsProps> = ({ handleSSOAuth }) => {
  return (
    <>
      <View style={styles.separatorContainer}>
        <View style={styles.separatorLine} />
        <Text style={styles.separatorText}>OR</Text>
        <View style={styles.separatorLine} />
      </View>

      <View style={styles.ssoContainer}>
        <TouchableOpacity
          style={styles.ssoButton}
          onPress={() => handleSSOAuth("oauth_google")}
        >
          <Text style={styles.ssoButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ssoButton}
          onPress={() => handleSSOAuth("oauth_github")}
        >
          <Text style={styles.ssoButtonText}>Continue with GitHub</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};
