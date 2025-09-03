// lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'react-native-get-random-values'; // Hermes crypto polyfill
import 'react-native-url-polyfill/auto';

// Supabase config
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Attach Clerk JWT token to Supabase session
export async function attachClerkJwt(token: string) {
  try {
    if (token) {
      await supabase.auth.setSession(token); // set JWT for requests
    }
  } catch (error) {
    console.error("Failed to attach Clerk JWT:", error);
  }
}
