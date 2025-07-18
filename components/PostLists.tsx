// components/PostsList.js
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { useUserSync } from "../hooks/useUserSync";
import { useSupabaseContext } from "./SupabaseProvider";

export const PostsList = () => {
  const { supabase, isReady } = useSupabaseContext();
  const { user } = useUserSync(); // This will sync user on mount
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isReady) {
      fetchPosts();
    }
  }, [isReady]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          users!posts_user_id_fkey (
            first_name,
            last_name,
            avatar_url
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View
          style={{
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#eee",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>{item.title}</Text>
          <Text style={{ marginTop: 8 }}>{item.content}</Text>
          <Text style={{ marginTop: 8, color: "#666" }}>
            By {item.users?.first_name} {item.users?.last_name}
          </Text>
        </View>
      )}
    />
  );
};
