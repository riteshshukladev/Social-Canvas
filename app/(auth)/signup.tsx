import { SSOButtons } from "@/components/SSOButtons";
import { useWarmUpBrowser } from "@/hooks/useWarmUpBrowser";
import { useAuth, useOAuth, useSignUp } from "@clerk/clerk-expo";
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

export default function SignupScreen() {
  useWarmUpBrowser();

  const router = useRouter();
  const { signUp, setActive, isLoaded } = useSignUp();
  const { isSignedIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);

  const [loading, setLoading] = useState(false);

  const { startOAuthFlow: startGoogleOAuthFlow } = useOAuth({
    strategy: "oauth_google",
  });
  const { startOAuthFlow: startGitHubOAuthFlow } = useOAuth({
    strategy: "oauth_github",
  });

  useEffect(() => {
    if (isSignedIn) {
      router.replace("/(screen)/profile");
    }
  }, [isSignedIn, router]);

  const handleSignUp = async () => {
    if (!isLoaded) return;

    if (!email || !password || !firstName || !lastName) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      // Start the email verification process
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err) {
      const errorMessage =
        err?.errors?.[0]?.message || "An unexpected error occurred.";
      Alert.alert("Signup Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handler for SSO (Google, GitHub)
  const handleSSOAuth = useCallback(
    async (strategy) => {
      try {
        const selectedOAuthFlow =
          strategy === "oauth_google"
            ? startGoogleOAuthFlow
            : startGitHubOAuthFlow;

        const { createdSessionId, setActive } = await selectedOAuthFlow();

        if (createdSessionId) {
          // If the user has a session, they are signed in
          setActive({ session: createdSessionId });
          // setTimeout(() => {
          //   router.dismissAll();
          //   router.replace("/(screen)/profile");
          // }, 100);
        }
      } catch (err) {
        console.error("OAuth error", err);
        const errorMessage =
          err?.errors?.[0]?.message ||
          "An error occurred during SSO authentication.";
        Alert.alert("SSO Error", errorMessage);
      }
    },
    [startGoogleOAuthFlow, startGitHubOAuthFlow, setActive, router]
  );

  // Handler for verifying the email code
  const handleVerifyEmail = async () => {
    if (!isLoaded) return;
    if (!code || code.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit code");
      return;
    }
    setLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push("/(screen)/profile");
      } else {
        Alert.alert("Error", "Verification failed. Please try again.");
      }
    } catch (err) {
      const errorMessage = err?.errors?.[0]?.message || "Verification failed.";
      Alert.alert("Verification Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
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
            <Text className="text-3xl mb-2 text-center pb-0 text-white tracking-wide font-sftmedium">
              Verify Your Email
            </Text>
            <Text className="text-sm font-normal text-center text-[#8A8888] tracking-wide font-sftlight">
              We've sent a verification code to your email.
            </Text>

            <View className=" shadow-sm border border-[rgba(255,255,255,0.15)] tracking-wide w-full rounded-lg my-8">
              <TextInput
                className="w-full py-4 px-5 text-sm text-white bg-transparent focus:outline-none placeholder:text-gray-400 placeholder:text-sm font-sftregular"
                placeholder="Enter 6-digit code"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            <TouchableOpacity
              className="w-full py-4 px-5 bg-transparent rounded-lg shadow-md text-base border border-[rgba(255,255,255,0.15)] tracking-wide items-center my-0"
              onPress={handleVerifyEmail}
              disabled={loading}
            >
              <Text className="text-[rgba(255,255,255,0.75)] font-normal font-sftregular text-base">
                {loading ? "Verifying..." : "Verify Email"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-5 items-center"
              onPress={() => setPendingVerification(false)}
            >
              <Text className="text-sm font-normal text-center text-[#f3f3f3] tracking-wide">
                <Text className="font-sftlight"> Back to Sign Up?</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

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
        <View className="px-10 py-12 border rounded-3xl bg-black shadow-md">
          <View className="flex flex-col items-center justify-center mb-6 tracking-wide">
            <Image
              source={require("../../assets/images/main-icon/main-logo-sec.png")}
              style={{ width: 50, height: 50, marginBottom: 16 }}
            />

            <Text className="text-3xl mb-2 text-center pb-0 text-white tracking-wide font-sftmedium">
              Create new Account
            </Text>
            <Text className="text-sm font-normal text-center text-[#8A8888] tracking-wide font-sftlight">
              have an account?{" "}
              <Link
                className="text-[#1E90FF] text-[#E6E6E6]"
                href="/(auth)/login"
              >
                sign in.
              </Link>
            </Text>
          </View>

          {/* Email/Password Form */}
          <View className="my-4 gap-6">
            <View className="flex flex-row justify-between">
              <View className=" shadow-sm border border-[rgba(255,255,255,0.15)] tracking-wide w-[49%] rounded-lg">
                <TextInput
                  className="w-full py-4 px-5 text-sm text-white bg-transparent focus:outline-none placeholder:text-gray-400 placeholder:text-sm font-sftregular"
                  placeholder="First name"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoComplete="given-name"
                />
              </View>
              <View className="shadow-sm border border-[rgba(255,255,255,0.15)] tracking-wide w-[49%] rounded-lg">
                <TextInput
                  className="w-full py-4 px-5 text-sm text-white bg-transparent focus:outline-none placeholder:text-gray-400 placeholder:text-sm font-sftregular"
                  placeholder="Last name"
                  value={lastName}
                  onChangeText={setLastName}
                  autoComplete="family-name"
                />
              </View>
            </View>

            <View className="flex flex-col items-center justify-center gap-6">
              <View className="w-full rounded-lg shadow-sm border border-[rgba(255,255,255,0.15)] tracking-wide">
                <TextInput
                  className="w-full py-4 px-5 text-sm text-white bg-transparent focus:outline-none placeholder:text-gray-400 placeholder:text-sm font-sftregular"
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
                  placeholder="Create a password (min. 8 chars)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="new-password"
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            // style={[styles.button, loading && styles.buttonDisabled]}
            className="w-full py-4 px-5 bg-transparent rounded-lg shadow-md font-normal text-base border border-[rgba(255,255,255,0.15)] tracking-wide items-center my-6"
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text className="text-[rgba(255,255,255,0.75)] font-normal font-sftregular text-base">
              {loading ? "Creating Account..." : "Sign Up"}
            </Text>
          </TouchableOpacity>

          {/* <View style={styles.linkContainer}>
            <Text style={styles.linkText}>
              Already have an account?{" "}
              <Link href="/login" style={styles.linkHighlight}>
                Sign In
              </Link>
            </Text>
          </View> */}
          <SSOButtons handleSSOAuth={handleSSOAuth} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
