// types/index.ts
import { SupabaseClient } from "@supabase/supabase-js";

// User types (from Clerk)
export interface ClerkUser {
  id: string;
  primaryEmailAddress?: { 
    emailAddress: string;
  };
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
}

// Database types
export interface DatabaseUser {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  updated_at: string;
}

export interface Catalog {
  id: string;
  name: string;
  creation_date: number;
  user_id: string;
  creation_time: string;
  created_at: string;
  users?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

// API Response types
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: any;
  message?: string;
}

// Function types
export interface GetTokenFunction {
  (options: { template: string }): Promise<string | null>;
}

// Supabase Context types
export interface SupabaseContextType {
  supabase: SupabaseClient;
  isReady: boolean;
}

// Hook return types
export interface CatalogOperationsHook {
  // Core state
  user: ClerkUser | null;
  isReady: boolean;
  connectionStatus: string;
  catalogs: Catalog[];
  loading: boolean;
  fetchCatalogsLoadingState: boolean;

  // UI states
  newCatalogName: string;
  setNewCatalogName: (name: string) => void;
  newCatalogYear: string;
  setNewCatalogYear: (year: string) => void;
  showCreateOverlay: boolean;
  showEmptyCatalogsModal: boolean;
  showDeleteModal: boolean;
  catalogToDelete: { id: string; name: string } | null;
  logOutModalVisible: boolean;

  // Core actions
  testConnection: () => Promise<void>;
  fetchCatalogs: () => Promise<void>;
  createCatalog: (name: string, year: string) => Promise<ServiceResponse<Catalog>>;
  deleteCatalog: (id: string) => Promise<ServiceResponse>;
  testJWT: () => Promise<ServiceResponse<string>>;

  // UI handlers
  handleCreateCatalog: () => Promise<void>;
  handleCreateCatalogFromEmpty: () => void;
  handleCloseEmptyCatalogsModal: () => void;
  handleLongPressCatalog: (catalog: { id: string; name: string }) => void;
  handleConfirmDelete: () => Promise<void>;
  toggleLogOutModal: () => void;
  handleCloseDeleteModal: () => void;
  handleSignOut: () => Promise<void>;
  toggleCreateOverlay: () => void;
  handleCatalogPress: (catalog: Catalog) => void; 
}


// Service types
export interface CatalogService {
  testConnection: (supabase: SupabaseClient) => Promise<ServiceResponse>;
  syncUser: (supabase: SupabaseClient, user: ClerkUser) => Promise<ServiceResponse>;
  fetchCatalogs: (supabase: SupabaseClient, userId: string) => Promise<ServiceResponse<Catalog[]>>;
  createCatalog: (
    supabase: SupabaseClient,
    user: ClerkUser,
    catalogName: string,
    catalogYear: string
  ) => Promise<ServiceResponse<Catalog>>;
  deleteCatalog: (supabase: SupabaseClient, catalogId: string) => Promise<ServiceResponse>;
  testJWT: (getToken: GetTokenFunction, user: ClerkUser) => Promise<ServiceResponse<string>>;
}