import { styles } from "@/styles/authstyles";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, router, useRouter } from "expo-router";
import React, { useState } from "react";
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
  const { signUp, setActive, isLoaded } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    const router = useRouter();
    

    if (!isLoaded) {
      return;
    }

    // Validation
    if (!email || !password || !firstName || !lastName) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {

      const signUpResponse = await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });


      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setPendingVerification(true);
    } catch (err) {
    

      // Better error handling
      let errorMessage = "An unexpected error occurred";

      if (err?.errors && err.errors.length > 0) {
        errorMessage = err.errors[0].message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      Alert.alert("Signup Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {

    if (!isLoaded) {
      return;
    }

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
        router.replace("/(screen)/profile");
      } else {
        
        Alert.alert("Error", "Verification failed. Please try again.");
      }
    } catch (err) {
      console.error("Verification error details:", {
        error: err,
        message: err?.message,
        errors: err?.errors,
        status: err?.status,
      });

      let errorMessage = "Verification failed";

      if (err?.errors && err.errors.length > 0) {
        errorMessage = err.errors[0].message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

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
              placeholder="Create a password"
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
