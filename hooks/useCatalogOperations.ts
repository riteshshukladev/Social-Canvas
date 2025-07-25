import { useSupabaseContext } from "@/components/SupabaseProvider";
import { catalogService } from "@/services/catalogServices";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Catalog, CatalogOperationsHook, ServiceResponse } from "../types";

export const useCatalogOperations = (): CatalogOperationsHook => {
  const { user } = useUser();
  const { getToken, signOut } = useAuth();
  const { supabase, isReady } = useSupabaseContext();
  const router = useRouter();

  // Core states
  const [connectionStatus, setConnectionStatus] = useState<string>("Testing...");
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchCatalogsLoadingState, setFetchCatalogsLoadingState] = useState<boolean>(false);

  // UI states
  const [newCatalogName, setNewCatalogName] = useState<string>("");
  const [newCatalogYear, setNewCatalogYear] = useState(
    new Date().getFullYear().toString()
  );
  const [showCreateOverlay, setShowCreateOverlay] = useState<boolean>(false);
  const [showEmptyCatalogsModal, setShowEmptyCatalogsModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [catalogToDelete, setCatalogToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [logOutModalVisible, setLogOutModalVisible] = useState<boolean>(false);

  // Test connection and setup on mount
  useEffect(() => {
    if (user && isReady) {
      testConnection();
    }
  }, [user, isReady]);

  // Show empty catalogs modal when there are no catalogs and not loading
  useEffect(() => {
    if (!fetchCatalogsLoadingState && catalogs.length === 0 && isReady) {
      setShowEmptyCatalogsModal(true);
    } else {
      setShowEmptyCatalogsModal(false);
    }
  }, [catalogs.length, fetchCatalogsLoadingState, isReady]);

  // Core functions
  const testConnection = async (): Promise<void> => {
    try {
      const connectionResult = await catalogService.testConnection(supabase);
      setConnectionStatus(connectionResult.message || "Unknown status");

      if (!connectionResult.success) return;

      await catalogService.syncUser(supabase, user);
      await fetchCatalogs();
    } catch (error: any) {
      setConnectionStatus(`❌ Error: ${error.message}`);
    }
  };

  const fetchCatalogs = async (): Promise<void> => {
    setFetchCatalogsLoadingState(true);
    try {
      if (!user) {
        setFetchCatalogsLoadingState(false);
        return;
      }
      const result = await catalogService.fetchCatalogs(supabase, user.id);
      if (result.success && result.data) {
        setCatalogs(result.data);
      }
    } finally {
      setFetchCatalogsLoadingState(false);
    }
  };

  const createCatalog = async (
    catalogName: string,
    catalogYear: string
  ): Promise<ServiceResponse<Catalog>> => {
    setLoading(true);
    try {
      const result = await catalogService.createCatalog(
        supabase,
        user,
        catalogName,
        catalogYear
      );

      if (result.success && result.data) {
        setCatalogs([result.data, ...catalogs]);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const deleteCatalog = async (catalogId: string): Promise<ServiceResponse> => {
    setLoading(true);
    try {
      const result = await catalogService.deleteCatalog(supabase, catalogId);
      if (result.success) {
        setCatalogs(catalogs.filter((catalog) => catalog.id !== catalogId));
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const testJWT = async (): Promise<ServiceResponse<string>> => {
    return await catalogService.testJWT(getToken, user);
  };

  // UI Handler functions
  const handleCreateCatalog = async (): Promise<void> => {
    const result = await createCatalog(newCatalogName, newCatalogYear);
    if (result.success) {
      setNewCatalogName("");
      setNewCatalogYear("");
      setShowCreateOverlay(false);
      setShowEmptyCatalogsModal(false);
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

  const toggleLogOutModal = () => {
    setLogOutModalVisible(!logOutModalVisible);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setCatalogToDelete(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Sign out failed:", error);
      // Fallback navigation
      router.replace("/(auth)/login");
    }
  };



  const toggleCreateOverlay = () => {
    setShowCreateOverlay(!showCreateOverlay);
  };

    const handleCatalogPress = (catalog: Catalog) => { // ← Change from string to Catalog
    router.push({
      pathname: "/(screen)/catalog/[id]", // ← Correct path (not components path)
      params: {
        id: catalog.id, // ← Use catalog.id, not the whole catalog
        name: catalog.name,
        year: catalog.creation_date.toString(),
      },
    });
  };

  return {
    // Core state
    user,
    isReady,
    connectionStatus,
    catalogs,
    loading,
    fetchCatalogsLoadingState,

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

    // Core actions
    testConnection,
    fetchCatalogs,
    createCatalog,
    deleteCatalog,
    testJWT,

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
  };

};
