// hooks/useCatalogOperations.ts
import { useSupabaseContext } from "@/components/SupabaseProvider";
import { catalogService } from "@/services/catalogServices";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import { Catalog, CatalogOperationsHook, ServiceResponse } from "../types";

export const useCatalogOperations = (): CatalogOperationsHook => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { supabase, isReady } = useSupabaseContext();

  const [connectionStatus, setConnectionStatus] = useState<string>("Testing...");
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchCatalogsLoadingState, setFetchCatalogsLoadingState] = useState<boolean>(false);

  // Test connection and setup on mount
  useEffect(() => {
    if (user && isReady) {
      testConnection();
    }
  }, [user, isReady]);

  const testConnection = async (): Promise<void> => {
    try {
      // Test 1: Basic Supabase connection
      const connectionResult = await catalogService.testConnection(supabase);
      setConnectionStatus(connectionResult.message || "Unknown status");

      if (!connectionResult.success) return;

      // Test 2: User sync
      await catalogService.syncUser(supabase, user);

      // Test 3: Fetch catalogs
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

  return {
    // State
    user,
    isReady,
    connectionStatus,
    catalogs,
    loading,
    
    // Actions
    testConnection,
    fetchCatalogs,
    createCatalog,
    deleteCatalog,
    testJWT,
    fetchCatalogsLoadingState,
  };
};