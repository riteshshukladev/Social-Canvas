import { SSOButtons } from "@/components/SSOButtons";
import { useWarmUpBrowser } from "@/hooks/useWarmUpBrowser";
import { styles } from "@/styles/authstyles";
import { useAuth, useOAuth, useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  useWarmUpBrowser();

  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { isSignedIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);

  const { startOAuthFlow: startGoogleOAuthFlow } = useOAuth({
    strategy: "oauth_google",
  });
  const { startOAuthFlow: startGitHubOAuthFlow } = useOAuth({
    strategy: "oauth_github",
  });

  const handleSignIn = async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const completeSignIn = await signIn.create({
        identifier: email,
        password,
      });

      if (completeSignIn.status === "complete") {
        await setActive({ session: completeSignIn.createdSessionId });
        // Remove the isSignedIn check - navigate directly
        router.dismissAll();
        router.push("/(screen)/profile");
      }
    } catch (err) {
      const errorMessage =
        err?.errors?.[0]?.message || "An error occurred during sign in.";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // In your login screen, add this useEffect
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.dismissAll();
      router.push("/(screen)/profile");
    }
  }, [isLoaded, isSignedIn, router]);

  // Update the SSO handler to not navigate directly
  const handleSSOAuth = useCallback(
    async (strategy) => {
      try {
        setSsoLoading(true);
        const selectedOAuthFlow =
          strategy === "oauth_google"
            ? startGoogleOAuthFlow
            : startGitHubOAuthFlow;

        const { createdSessionId } = await selectedOAuthFlow();

        if (createdSessionId) {
          await setActive({ session: createdSessionId });
          // Don't navigate here - let the useEffect handle it
        }
      } catch (err) {
        console.error("OAuth error", err);
        const errorMessage =
          err?.errors?.[0]?.message ||
          "An error occurred during SSO authentication.";
        Alert.alert("SSO Error", errorMessage);
      } finally {
        setSsoLoading(false);
      }
    },
    [startGoogleOAuthFlow, startGitHubOAuthFlow, setActive]
  );

  return (
    <KeyboardAvoidingView
      className="container"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="scrollContainer"
        contentContainerStyle={{
          justifyContent: "center",
          flexGrow: 1,
          padding: 8,
        }}
      >
        <View className="auth-container">
          <View className="auth-heading-container">
            <Image src="" className="" />
            <Text className="auth-heading">Welcome Back</Text>
            <Text className="auth-subheading">
              first time here?{" "}
              <Link className="auth-sublink" href="/(auth)/signup">
                sign up.
              </Link>
            </Text>
          </View>
          <View className="formContainer">
            <View className="inputContainer">
              <TextInput
                className="input"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View className="inputContainer">
              <TextInput
                className="input"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSignIn}
            disabled={loading}
            className="button"
          >
            <Text className="buttonText">
              {loading ? "Signing In..." : "Sign In"}
            </Text>
          </TouchableOpacity>

          <SSOButtons handleSSOAuth={handleSSOAuth} />

          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>
              Don't have an account?{" "}
              <Link href="/signup" style={styles.linkHighlight}>
                Sign Up
              </Link>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
