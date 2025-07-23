// components/TestSupabaseClerk.tsx
import { useAuth } from "@clerk/clerk-expo";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCatalogOperations } from "../hooks/useCatalogOperations";
import { CreateCatalogOverlay } from "./CreateCatalogOverlay";
import { DeleteCatalogModal } from "./DeleteCatalogModal";
import EmptyCatalogs from "./EmptyCatalogs";

export const TestSupabaseClerk: React.FC = () => {
  const [newCatalogName, setNewCatalogName] = useState<string>("");
  const [newCatalogYear, setNewCatalogYear] = useState(
    new Date().getFullYear().toString()
  );
  const [showCreateOverlay, setShowCreateOverlay] = useState<boolean>(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [catalogToDelete, setCatalogToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

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
    fetchCatalogsLoadingState,
  } = useCatalogOperations();

  const handleCreateCatalog = async (): Promise<void> => {
    const result = await createCatalog(newCatalogName, newCatalogYear);
    if (result.success) {
      setNewCatalogName("");
      setNewCatalogYear("");
      setShowCreateOverlay(false);
    }
  };

  const handleLongPressCatalog = (catalog: { id: string; name: string }) => {
    // Only allow deletion of user's own catalogs
    const userCatalog = catalogs.find(
      (c) => c.id === catalog.id && c.user_id === user?.id
    );
    if (userCatalog) {
      setCatalogToDelete(catalog);
      setShowDeleteModal(true);
    }
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (catalogToDelete) {
      const result = await deleteCatalog(catalogToDelete.id);
      setShowDeleteModal(false);
      setCatalogToDelete(null);
    }
  };

  const { signOut } = useAuth();

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setCatalogToDelete(null);
  };
  const handleSignOut = async () => {
    try {
      await signOut();
      // Optionally, redirect to login or home scree
    } catch (error) {
      console.error("Sign out failed:", error);
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
    <>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView className="bg-primary px-3">
          {/* User Info */}
          <View className="flex flex-row w-full justify-between py-2">
            <Text className="text-base font-sftmedium tracking-wide">
              {user.firstName} {user.lastName}
            </Text>
            <TouchableOpacity onPress={() => setShowCreateOverlay(true)}>
              <Text className="text-base font-sftmedium tracking-wide pb-0.3 border-b border-black">
                Create Catalog
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSignOut}>
              <Text className="text-base font-sftmedium tracking-wide pb-0.3 border-b border-black">
                Logout
              </Text>
            </TouchableOpacity>
          </View>

          {/* Catalogs List */}
          <View className="flex flex-col w-full gap-49- pt-8">
            {fetchCatalogsLoadingState ? (
              <ActivityIndicator size="large" />
            ) : catalogs.length === 0 ? (
              <EmptyCatalogs
                name={user.firstName ?? ""}
                onCreateCatalog={() => setShowCreateOverlay(true)}
              />
            ) : (
              catalogs.map((catalog) => (
                <TouchableOpacity
                  key={catalog.id}
                  onLongPress={() =>
                    handleLongPressCatalog({
                      id: catalog.id,
                      name: catalog.name,
                    })
                  }
                  delayLongPress={500} // 500ms long press duration
                  className="flex flex-row w-full justify-between pb-2 pt-2 border-b border-black"
                  activeOpacity={0.7}
                >
                  <Text className="text-lg font-sftmedium tracking">
                    {catalog.name}
                  </Text>
                  <Text className="text-lg font-sftmedium tracking">
                    {catalog.creation_date}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Create Catalog Overlay */}
      <CreateCatalogOverlay
        visible={showCreateOverlay}
        onClose={() => setShowCreateOverlay(false)}
        catalogName={newCatalogName}
        setCatalogName={setNewCatalogName}
        onSubmit={handleCreateCatalog}
        loading={loading}
      />

      {/* Delete Catalog Modal */}
      <DeleteCatalogModal
        visible={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        catalogName={catalogToDelete?.name || ""}
        loading={loading}
      />
    </>
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
