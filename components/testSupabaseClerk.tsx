// components/TestSupabaseClerk.tsx
import React, { useState } from "react";
import {
  ActivityIndicator,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useCatalogOperations } from "../hooks/useCatalogOperations";

export const TestSupabaseClerk: React.FC = () => {
  const [newCatalogName, setNewCatalogName] = useState<string>("");
  const [newCatalogYear, setNewCatalogYear] = useState<string>("");

  const {
    user,
    isReady,
    connectionStatus,
    catalogs,
    loading,
    testConnection,
    fetchCatalogs,
    createCatalog,
    deleteCatalog,
    testJWT,
  } = useCatalogOperations();

  const handleCreateCatalog = async (): Promise<void> => {
    const result = await createCatalog(newCatalogName, newCatalogYear);
    if (result.success) {
      setNewCatalogName("");
      setNewCatalogYear("");
    }
  };

  const handleDeleteCatalog = async (catalogId: string): Promise<void> => {
    await deleteCatalog(catalogId);
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
      <Text style={styles.title}>📚 Clerk + Supabase Catalog Test</Text>

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

      {/* Create Catalog */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 Create Catalog</Text>
        <TextInput
          style={styles.input}
          placeholder="Catalog name"
          value={newCatalogName}
          onChangeText={setNewCatalogName}
        />
        <TextInput
          style={styles.input}
          placeholder="Creation year (e.g., 2024)"
          value={newCatalogYear}
          onChangeText={setNewCatalogYear}
          keyboardType="numeric"
        />
        <Button
          title={loading ? "Creating..." : "Create Catalog"}
          onPress={handleCreateCatalog}
          disabled={loading}
        />
      </View>

      {/* Catalogs List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📚 Catalogs ({catalogs.length})</Text>
        <Button title="Refresh Catalogs" onPress={fetchCatalogs} />

        {loading && <ActivityIndicator style={{ marginTop: 10 }} />}

        {catalogs.map((catalog) => (
          <View key={catalog.id} style={styles.catalogItem}>
            <Text style={styles.catalogName}>{catalog.name}</Text>
            <Text style={styles.catalogYear}>
              Year: {catalog.creation_date}
            </Text>
            <Text style={styles.catalogMeta}>
              By: {catalog.users?.first_name} {catalog.users?.last_name}
            </Text>
            <Text style={styles.catalogMeta}>
              Created: {new Date(catalog.creation_time).toLocaleDateString()}
            </Text>
            <Text style={styles.catalogMeta}>
              Record Added: {new Date(catalog.created_at).toLocaleDateString()}
            </Text>

            {/* Only show delete button for own catalogs */}
            {catalog.user_id === user.id && (
              <Button
                title="Delete"
                color="red"
                onPress={() => handleDeleteCatalog(catalog.id)}
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
  catalogItem: {
    marginTop: 15,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  catalogName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  catalogYear: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563eb",
    marginBottom: 5,
  },
  catalogMeta: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
});
