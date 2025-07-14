import { SSOButtons } from "@/components/SSOButtons";
import { useWarmUpBrowser } from "@/hooks/useWarmUpBrowser";
import { styles } from "@/styles/authstyles";
import { useAuth, useOAuth, useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
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
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>
              We've sent a verification code to {email}
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Verification Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit code"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerifyEmail}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Verifying..." : "Verify Email"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkContainer}
              onPress={() => setPendingVerification(false)}
            >
              <Text style={styles.linkText}>
                <Text style={styles.linkHighlight}>← Back to Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>

          {/* SSO Buttons are the primary option */}
          <SSOButtons handleSSOAuth={handleSSOAuth} />

          {/* Separator for clarity */}
          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>OR SIGN UP WITH EMAIL</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* Email/Password Form */}
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                placeholder="First name"
                value={firstName}
                onChangeText={setFirstName}
                autoComplete="given-name"
              />
            </View>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Last name"
                value={lastName}
                onChangeText={setLastName}
                autoComplete="family-name"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a password (min. 8 chars)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Creating Account..." : "Sign Up"}
            </Text>
          </TouchableOpacity>

          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>
              Already have an account?{" "}
              <Link href="/login" style={styles.linkHighlight}>
                Sign In
              </Link>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
