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
  // State
  user: ClerkUser | null | undefined;
  isReady: boolean;
  connectionStatus: string;
  catalogs: Catalog[];
  loading: boolean;
  
  // Actions
  testConnection: () => Promise<void>;
  fetchCatalogs: () => Promise<void>;
  createCatalog: (catalogName: string, catalogYear: string) => Promise<ServiceResponse<Catalog>>;
  deleteCatalog: (catalogId: string) => Promise<ServiceResponse>;
  testJWT: () => Promise<ServiceResponse<string>>;
}

// Service types
export interface CatalogService {
  testConnection: (supabase: SupabaseClient) => Promise<ServiceResponse>;
  syncUser: (supabase: SupabaseClient, user: ClerkUser) => Promise<ServiceResponse>;
  fetchCatalogs: (supabase: SupabaseClient) => Promise<ServiceResponse<Catalog[]>>;
  createCatalog: (
    supabase: SupabaseClient,
    user: ClerkUser,
    catalogName: string,
    catalogYear: string
  ) => Promise<ServiceResponse<Catalog>>;
  deleteCatalog: (supabase: SupabaseClient, catalogId: string) => Promise<ServiceResponse>;
  testJWT: (getToken: GetTokenFunction, user: ClerkUser) => Promise<ServiceResponse<string>>;
}