import { SSOButtons } from "@/components/SSOButtons";
import { useWarmUpBrowser } from "@/hooks/useWarmUpBrowser";
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
// import Logo from "../../assets/images/main-icon/main-logo.svg";
//  // Adjust the import based on your actual logo file type
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
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          justifyContent: "center",
          flexGrow: 1,
          padding: 8,
        }}
      >
        <View className="px-10 py-12 border  rounded-3xl bg-black shadow-md">
          <View className="flex flex-col items-center justify-center mb-6 tracking-wide">
            <Image
              source={require("../../assets/images/main-icon/main-logo-sec.png")}
              style={{ width: 50, height: 50, marginBottom: 16 }}
            />
            <Text className="text-3xl mb-2 text-center pb-0 text-white tracking-wide font-sftmedium">
              Welcome Back
            </Text>
            <Text className="text-sm font-normal text-center text-[#8A8888] tracking-wide font-sftlight">
              first time here?{" "}
              <Link
                className="text-[#1E90FF] text-[#E6E6E6]"
                href="/(auth)/signup"
              >
                sign up.
              </Link>
            </Text>
          </View>
          <View className="flex flex-col items-center justify-center gap-8 my-6">
            <View className="w-full rounded-lg shadow-sm border border-[rgba(255,255,255,0.15)] tracking-wide">
              <TextInput
                className="w-full py-4 px-5 text-sm text-white bg-transparent focus:outline-none placeholder:text-gray-400 placeholder:text-sm rounded-lg font-sftregular"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View className="w-full rounded-lg shadow-sm border border-[rgba(255,255,255,0.15)] tracking-wide">
              <TextInput
                className="w-full py-4 px-5 text-sm text-white bg-transparent focus:outline-none placeholder:text-gray-400 placeholder:text-sm font-sftregular"
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
            className="w-full py-4 px-5 bg-black rounded-lg shadow-md font-normal text-base border border-[rgba(255,255,255,0.15)] tracking-wide items-center my-6"
          >
            <Text className="text-[rgba(255,255,255,0.85)] font-sftregular text-base">
              {loading ? "Signing In..." : "Sign In"}
            </Text>
          </TouchableOpacity>

          <SSOButtons handleSSOAuth={handleSSOAuth} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
