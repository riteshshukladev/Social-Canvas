// components/TestSupabaseClerk.tsx
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
import LogoutModal from "./LogoutModal";

export const TestSupabaseClerk: React.FC = () => {
  const router = useRouter();
  const [newCatalogName, setNewCatalogName] = useState<string>("");
  const [newCatalogYear, setNewCatalogYear] = useState(
    new Date().getFullYear().toString()
  );
  const [showCreateOverlay, setShowCreateOverlay] = useState<boolean>(false);
  const [showEmptyCatalogsModal, setShowEmptyCatalogsModal] =
    useState<boolean>(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [catalogToDelete, setCatalogToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [logOutModalVisible, setLogOutModalVisible] = useState<boolean>(false);

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

  // Show empty catalogs modal when there are no catalogs and not loading
  useEffect(() => {
    if (!fetchCatalogsLoadingState && catalogs.length === 0 && isReady) {
      setShowEmptyCatalogsModal(true);
    } else {
      setShowEmptyCatalogsModal(false);
    }
  }, [catalogs.length, fetchCatalogsLoadingState, isReady]);

  const handleCreateCatalog = async (): Promise<void> => {
    const result = await createCatalog(newCatalogName, newCatalogYear);
    if (result.success) {
      setNewCatalogName("");
      setNewCatalogYear("");
      setShowCreateOverlay(false);
      setShowEmptyCatalogsModal(false); // Hide empty modal after creating catalog
    }
  };

  const handleCreateCatalogFromEmpty = () => {
    setShowEmptyCatalogsModal(false);
    setShowCreateOverlay(true);
  };

  const handleCloseEmptyCatalogsModal = () => {
    setShowEmptyCatalogsModal(false);
  };

  const handleLongPressCatalog = (catalog: { id: string; name: string }) => {
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

  const logOutModalState = () => {
    setLogOutModalVisible(!logOutModalVisible);
  };

  const { signOut } = useAuth();

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setCatalogToDelete(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.dismissAll();
      router.push("/(auth)/login");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };


  // Add the loading screen
  // if (!isReady) {
  //   return (
  //     <View style={styles.container}>
  //       <ActivityIndicator size="large" />
  //       <Text>Setting up Supabase...</Text>
  //     </View>
  //   );
  // }

  return (
    <>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView className="bg-primary px-3">
          {/* User Info */}
          <View className="flex flex-row w-full justify-between py-2">
            <TouchableOpacity onPress={logOutModalState}>
              <Text className="text-base font-sftmedium tracking-wide">
                {user.firstName} {user.lastName}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowCreateOverlay(true)}>
              <Text className="text-base font-sftmedium tracking-wide pb-0.3 border-b border-black">
                Create Catalog
              </Text>
            </TouchableOpacity>
           
          </View>

          {/* Catalogs List */}
          <View className="flex flex-col w-full gap-49- pt-8">
            {fetchCatalogsLoadingState ? (
              <ActivityIndicator size="large" />
            ) : catalogs.length === 0 ? (
              <Text className="text-center text-lg font-sftbold tracking-wide pt-4">
                No catalogs.
              </Text>
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
                  delayLongPress={500} 
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

      <EmptyCatalogs
        name={user.firstName ?? ""}
        visible={showEmptyCatalogsModal}
        onClose={handleCloseEmptyCatalogsModal}
        onCreateCatalog={handleCreateCatalogFromEmpty}
      />

      {/* Create Catalog Overlay */}
      <CreateCatalogOverlay
        visible={showCreateOverlay}
        onClose={() => setShowCreateOverlay(false)}
        catalogName={newCatalogName}
        setCatalogName={setNewCatalogName}
        catalogYear={newCatalogYear}
        setCatalogYear={setNewCatalogYear}
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
      {/* Log Out Modal */}
      <LogoutModal
        visible={logOutModalVisible}
        onClose={logOutModalState}
        onLogout={handleSignOut}
      />
    </>
  );
};

