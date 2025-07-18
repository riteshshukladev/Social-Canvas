import { TestSupabaseClerk } from "@/components/testSupabaseClerk";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React from "react";

const Profile = () => {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  return <TestSupabaseClerk />;
};

export default Profile;
