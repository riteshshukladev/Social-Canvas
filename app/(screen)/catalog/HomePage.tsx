import SequentialDonutLoader from "@/components/Loader/SequentialDonutLoader";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { CreateCatalogOverlay } from "../../../components/CreateCatalogOverlay";
import { DeleteCatalogModal } from "../../../components/DeleteCatalogModal";
import EmptyCatalogs from "../../../components/EmptyCatalogs";
import LogoutModal from "../../../components/LogoutModal";
import { useCatalogOperations } from "../../../hooks/useCatalogOperations";

const HomePage: React.FC = () => {
  const {
    // Core state
    user,
    catalogs,
    fetchCatalogsLoadingState,
    loading,

    // UI states
    newCatalogName,
    setNewCatalogName,
    newCatalogYear,
    setNewCatalogYear,
    showCreateOverlay,
    showEmptyCatalogsModal,
    showDeleteModal,
    catalogToDelete,
    logOutModalVisible,

    // UI handlers
    handleCreateCatalog,
    handleCreateCatalogFromEmpty,
    handleCloseEmptyCatalogsModal,
    handleLongPressCatalog,
    handleConfirmDelete,
    toggleLogOutModal,
    handleCloseDeleteModal,
    handleSignOut,
    toggleCreateOverlay,
    handleCatalogPress,
  } = useCatalogOperations();

  const colorScheme = useColorScheme();
  const borderColor = colorScheme === "dark" ? "#cdcdcd" : "#000";

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>❌ No User Found</Text>
        <Text>Please sign in with Clerk</Text>
      </View>
    );
  }

  // Show full-screen loader when initially loading catalogs
  if (fetchCatalogsLoadingState) {
    return (
      <View style={styles.fullScreenLoader}>
        <SequentialDonutLoader
          size={60}
          ball={13}
          text="Finding Your Catalogs..."
          p
        />
      </View>
    );
  }

  // Show full-screen loader when no catalogs exist
  if (catalogs.length === 0) {
    return (
      <View style={styles.fullScreenLoader}>
        <EmptyCatalogs
          name={user.firstName ?? ""}
          visible={true}
          onClose={handleCloseEmptyCatalogsModal}
          onCreateCatalog={handleCreateCatalogFromEmpty}
          borderChange={borderColor}
        />
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
            <TouchableOpacity onPress={toggleLogOutModal}>
              <Text className="text-base font-sftmedium tracking-wide">
                {user.firstName} {user.lastName}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleCreateOverlay}>
              <Text
                className="text-base font-sftmedium tracking-wide pb-0.3 border-b"
                style={{ borderColor: borderColor }}
              >
                Create Catalog
              </Text>
            </TouchableOpacity>
          </View>

          {/* Catalogs List */}
          <View className="flex flex-col w-full gap-49- pt-8">
            {catalogs.map((catalog) => (
              <TouchableOpacity
                key={catalog.id}
                onPress={() => handleCatalogPress(catalog)}
                onLongPress={() =>
                  handleLongPressCatalog({
                    id: catalog.id,
                    name: catalog.name,
                  })
                }
                delayLongPress={500}
                className="flex flex-row w-full justify-between pb-2 pt-2 border-b"
                style={{ borderColor }}
                activeOpacity={0.7}
              >
                <Text className="text-lg font-sftmedium tracking">
                  {catalog.name}
                </Text>
                <Text className="text-lg font-sftmedium tracking">
                  {catalog.creation_date}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modals */}
      <EmptyCatalogs
        name={user.firstName ?? ""}
        visible={showEmptyCatalogsModal}
        onClose={handleCloseEmptyCatalogsModal}
        onCreateCatalog={handleCreateCatalogFromEmpty}
        borderChange={borderColor}
      />

      <CreateCatalogOverlay
        visible={showCreateOverlay}
        onClose={toggleCreateOverlay}
        catalogName={newCatalogName}
        setCatalogName={setNewCatalogName}
        catalogYear={newCatalogYear}
        setCatalogYear={setNewCatalogYear}
        onSubmit={handleCreateCatalog}
        loading={loading}
        borderChange={borderColor}
      />

      <DeleteCatalogModal
        visible={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        catalogName={catalogToDelete?.name || ""}
        loading={loading}
        borderChange={borderColor}
      />

      <LogoutModal
        visible={logOutModalVisible}
        onClose={toggleLogOutModal}
        onLogout={handleSignOut}
        borderChange={borderColor}
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
  fullScreenLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});

export default HomePage;
