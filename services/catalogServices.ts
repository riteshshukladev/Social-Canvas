// services/catalogService.ts
import { SupabaseClient } from "@supabase/supabase-js";
import { Alert } from "react-native";
import {
    Catalog,
    CatalogService,
    ClerkUser,
    GetTokenFunction,
    ServiceResponse,
} from "../types";

export const catalogService: CatalogService = {
  // Test basic Supabase connection
  async testConnection(supabase: SupabaseClient): Promise<ServiceResponse> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("count")
        .limit(1);

      if (error) {
        return { success: false, message: `❌ Connection Error: ${error.message}` };
      }

      return { success: true, message: "✅ Supabase Connected!" };
    } catch (error: any) {
      return { success: false, message: `❌ Error: ${error.message}` };
    }
  },

  // Sync user data to Supabase
  async syncUser(supabase: SupabaseClient, user: ClerkUser): Promise<ServiceResponse> {
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
        return { success: false, error };
      } else {
        return { success: true, data };
      }
    } catch (error: any) { 
      return { success: false, error };
    }
  },

  // Fetch all catalogs
// services/catalogService.ts

// Update the function signature to accept user
async fetchCatalogs(
  supabase: SupabaseClient, 
  userId: string  
): Promise<ServiceResponse<Catalog[]>> {
  try {
    const { data, error } = await supabase
      .from("catalog")
      .select(
        `
        *,
        users!catalog_user_id_fkey (
          first_name,
          last_name,
          email
        )
      `
      )
      .eq("user_id", userId) // ← Add this filter!
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    Alert.alert("Fetch Error", error.message);
    return { success: false, error };
  }
},


  // Create a new catalog with retry logic
  async createCatalog(
    supabase: SupabaseClient,
    user: ClerkUser,
    catalogName: string,
    catalogYear: string
  ): Promise<ServiceResponse<Catalog>> {
    // Validation
    if (!catalogName.trim()) {
      Alert.alert("Error", "Please enter a catalog name");
      return { success: false, error: "No catalog name" };
    }

    if (!catalogYear.trim()) {
      Alert.alert("Error", "Please enter a creation year");
      return { success: false, error: "No catalog year" };
    }

    const year = parseInt(catalogYear);
    if (isNaN(year) || year < 1900 || year > 2100) {
      Alert.alert("Error", "Please enter a valid year between 1900 and 2100");
      return { success: false, error: "Invalid year" };
    }

    try {
      // Retry logic for JWT expiration
      let retries = 0;
      const maxRetries = 2;

      while (retries <= maxRetries) {
        try {
          const { data, error } = await supabase.from("catalog").insert([
            {
              name: catalogName,
              creation_date: year,
              user_id: user.id,
            },
          ]).select(`
              *,
              users!catalog_user_id_fkey (
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

          Alert.alert("✅ Success", "Catalog created successfully!");
          return { success: true, data: data[0] };
        } catch (error: any) {
          if (retries === maxRetries) {
            throw error;
          }
          retries++;
        }
      }

      return { success: false, error: "Max retries reached" };
    } catch (error: any) {
      Alert.alert("Create Error", error.message);
      return { success: false, error };
    }
  },

  // Delete a catalog
  async deleteCatalog(supabase: SupabaseClient, catalogId: string): Promise<ServiceResponse> {
    try {
      const { error } = await supabase
        .from("catalog")
        .delete()
        .eq("id", catalogId);

      if (error) throw error;

      Alert.alert("✅ Success", "Catalog deleted successfully!");
      return { success: true };
    } catch (error: any) {
      Alert.alert("Delete Error", error.message);
      return { success: false, error };
    }
  },

  // Test JWT token
  async testJWT(getToken: GetTokenFunction, user: ClerkUser): Promise<ServiceResponse<string>> {
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
      
      return { success: true, data: token || "" };
    } catch (error: any) {
      console.error("JWT Error:", error);
      return { success: false, error };
    }
  }
};