import { SupabaseClient } from "@supabase/supabase-js";
import React, { createContext, ReactNode, useContext } from "react";
import { useSupabase } from "../hooks/useSupabase";

interface SupabaseContextType {
  supabase: SupabaseClient;
  isReady: boolean;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(
  undefined
);

interface SupabaseProviderProps {
  children: ReactNode;
}

export const SupabaseProvider: React.FC<SupabaseProviderProps> = ({
  children,
}) => {
  const { supabase, isReady } = useSupabase();

  return (
    <SupabaseContext.Provider value={{ supabase, isReady }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabaseContext = (): SupabaseContextType => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabaseContext must be used within SupabaseProvider");
  }
  return context;
};
