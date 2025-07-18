import { useAuth, useUser } from "@clerk/clerk-expo"; // Add useAuth here
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSupabaseContext } from "./SupabaseProvider";

export const TestSupabaseClerk = () => {
  const { user } = useUser();
  const { getToken } = useAuth(); // Now getToken is available from useAuth
  const { supabase, isReady } = useSupabaseContext();

  const [connectionStatus, setConnectionStatus] = useState("Testing...");
  const [posts, setPosts] = useState([]);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [loading, setLoading] = useState(false);

  // Test 1: Check Clerk user and Supabase connection
  useEffect(() => {
    if (user && isReady) {
      testConnection();
    }
  }, [user, isReady]);

  const testConnection = async () => {
    try {
      // Test 1: Basic Supabase connection
      const { data, error } = await supabase
        .from("users")
        .select("count")
        .limit(1);

      if (error) {
        setConnectionStatus(`❌ Connection Error: ${error.message}`);
        return;
      }

      setConnectionStatus("✅ Supabase Connected!");

      // Test 2: User sync
      await testUserSync();

      // Test 3: Fetch posts
      await fetchPosts();
    } catch (error) {
      setConnectionStatus(`❌ Error: ${error.message}`);
    }
  };

  const testUserSync = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .upsert({
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          first_name: user.firstName,
          last_name: user.lastName,
          avatar_url: user.imageUrl,
          updated_at: new Date().toISOString(),
        })
        .select();

      if (error) {
        Alert.alert("User Sync Error", error.message);
      } else {
        Alert.alert("✅ User Sync Success", "User data synced to Supabase!");
      }
    } catch (error) {
      Alert.alert("User Sync Error", error.message);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          users!posts_user_id_fkey (
            first_name,
            last_name,
            email
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      Alert.alert("Fetch Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const testJWT = async () => {
    try {
      const token = await getToken({ template: "supabase" });
      console.log("JWT Token exists:", !!token);

      if (token) {
        // Decode the token to see what's inside (for debugging)
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("JWT Payload:", payload);
        console.log("User ID from JWT:", payload.sub);
        console.log("Current Clerk User ID:", user.id);
      } else {
        console.log("No token retrieved.");
      }
    } catch (error) {
      console.error("JWT Error:", error);
    }
  };

  const createPost = async () => {
    if (!newPostTitle.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    setLoading(true);
    try {
      // Retry logic for JWT expiration
      let retries = 0;
      const maxRetries = 2;

      while (retries <= maxRetries) {
        try {
          const { data, error } = await supabase.from("posts").insert([
            {
              title: newPostTitle,
              content: newPostContent,
              user_id: user.id,
            },
          ]).select(`
              *,
              users!posts_user_id_fkey (
                first_name,
                last_name,
                email
              )
            `);

          if (error) {
            if (error.message.includes("JWT") && retries < maxRetries) {
              console.log(
                `JWT expired, retrying... (${retries + 1}/${maxRetries})`
              );
              retries++;
              await new Promise((resolve) => setTimeout(resolve, 1000));
              continue;
            }
            throw error;
          }

          setPosts([data[0], ...posts]);
          setNewPostTitle("");
          setNewPostContent("");
          Alert.alert("✅ Success", "Post created successfully!");
          break;
        } catch (error) {
          if (retries === maxRetries) {
            throw error;
          }
          retries++;
        }
      }
    } catch (error) {
      Alert.alert("Create Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId);

      if (error) throw error;

      setPosts(posts.filter((post) => post.id !== postId));
      Alert.alert("✅ Success", "Post deleted successfully!");
    } catch (error) {
      Alert.alert("Delete Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>❌ No User Found</Text>
        <Text>Please sign in with Clerk</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Setting up Supabase...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🧪 Clerk + Supabase Test</Text>

      {/* User Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Clerk User Info</Text>
        <Text>ID: {user.id}</Text>
        <Text>Email: {user.primaryEmailAddress?.emailAddress}</Text>
        <Text>
          Name: {user.firstName} {user.lastName}
        </Text>
      </View>

      {/* Connection Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔗 Connection Status</Text>
        <Text>{connectionStatus}</Text>
        <Button title="Test Connection" onPress={testConnection} />
      </View>

      {/* Create Post */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✍️ Create Post</Text>
        <TextInput
          style={styles.input}
          placeholder="Post title"
          value={newPostTitle}
          onChangeText={setNewPostTitle}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Post content"
          value={newPostContent}
          onChangeText={setNewPostContent}
          multiline
        />
        <Button
          title={loading ? "Creating..." : "Create Post"}
          onPress={createPost}
          disabled={loading}
        />
      </View>

      {/* Posts List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 Posts ({posts.length})</Text>
        <Button title="Refresh Posts" onPress={fetchPosts} />

        {loading && <ActivityIndicator style={{ marginTop: 10 }} />}

        {posts.map((post) => (
          <View key={post.id} style={styles.postItem}>
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postContent}>{post.content}</Text>
            <Text style={styles.postMeta}>
              By: {post.users?.first_name} {post.users?.last_name}
            </Text>
            <Text style={styles.postMeta}>
              Created: {new Date(post.created_at).toLocaleDateString()}
            </Text>

            {/* Only show delete button for own posts */}
            {post.user_id === user.id && (
              <Button
                title="Delete"
                color="red"
                onPress={() => deletePost(post.id)}
              />
            )}
          </View>
        ))}
        <Button title="Test JWT" onPress={testJWT} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  postItem: {
    marginTop: 15,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  postTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  postContent: {
    fontSize: 14,
    marginBottom: 10,
  },
  postMeta: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
});
