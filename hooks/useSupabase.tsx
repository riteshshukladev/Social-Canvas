// hooks/useSupabase.tsx - MINIMAL CHANGES VERSION
import { useAuth } from "@clerk/clerk-expo";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

export const useSupabase = () => {
  const { getToken, isSignedIn } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const tokenRef = useRef(null);
  const refreshIntervalRef = useRef(null);

  const refreshToken = useCallback(async () => {
    if (!isSignedIn) return null;

    try {
      const token = await getToken({ template: "supabase" });

      if (token) {
        tokenRef.current = token;

        // ✅ KEEP YOUR ORIGINAL APPROACH - IT WORKS!
        // Don't change this - your catalog functionality depends on it
        supabase.realtime.setAuth(token);
        supabase.rest.headers = {
          ...supabase.rest.headers,
          Authorization: `Bearer ${token}`,
        };

        return token;
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
    }

    return null;
  }, [isSignedIn, getToken]);

  const setupTokenRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // ✅ KEEP YOUR ORIGINAL TIMING - 45 seconds works for you
    refreshIntervalRef.current = setInterval(async () => {
      console.log("Refreshing JWT token...");
      await refreshToken();
    }, 45000); // Keep your original 45 second interval

    refreshToken();
  }, [refreshToken]);

  useEffect(() => {
    if (isSignedIn) {
      setupTokenRefresh();
      setIsReady(true);
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      tokenRef.current = null;
      setIsReady(false);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [isSignedIn, setupTokenRefresh]);

  // ✅ KEEP YOUR EXACT PROXY LOGIC - Don't change anything here
  const enhancedSupabase = {
    ...supabase,
    from: (table) => {
      const originalFrom = supabase.from(table);

      // Create a proxy that intercepts promise methods
      const createQueryProxy = (queryBuilder) => {
        return new Proxy(queryBuilder, {
          get(target, prop) {
            // Handle promise methods (these actually execute the query)
            if (prop === "then" || prop === "catch" || prop === "finally") {
              const originalMethod = target[prop];
              if (typeof originalMethod === "function") {
                return function (...args) {
                  // Wrap the promise to handle JWT errors
                  const wrappedPromise = new Promise(
                    async (resolve, reject) => {
                      try {
                        const result = await target;

                        // Check if result has error property and it's a JWT error
                        if (
                          result &&
                          result.error &&
                          result.error.message &&
                          result.error.message.includes("JWT")
                        ) {
                          console.log(
                            "JWT expired, refreshing token and retrying..."
                          );
                          await refreshToken();
                          // Retry the original query
                          const retryResult = await supabase
                            .from(table)
                            [target.constructor.name](...(target.args || []));
                          resolve(retryResult);
                        } else {
                          resolve(result);
                        }
                      } catch (error) {
                        console.error("Query error:", error);
                        reject(error);
                      }
                    }
                  );

                  return wrappedPromise[prop].call(wrappedPromise, ...args);
                };
              }
            }

            // Handle other methods (these return new query builders)
            if (typeof target[prop] === "function") {
              return function (...args) {
                const result = target[prop](...args);
                return createQueryProxy(result);
              };
            }

            return target[prop];
          },
        });
      };

      return createQueryProxy(originalFrom);
    },
  };

  // Add this to your canvasStore.ts for debugging
  async function debugCanvasAccess(userId: string, canvasName: string) {
    console.log("=== DEBUG CANVAS ACCESS ===");
    console.log("User ID:", userId);
    console.log("Canvas Name:", canvasName);

    try {
      // Test 1: Check if we can query without RLS (should work with proper JWT)
      const { data: allCanvases, error: allError } = await supabase
        .from("canvases")
        .select("user_id, canvas_name, created_at");

      console.log("All canvases query result:", {
        data: allCanvases,
        error: allError,
      });

      // Test 2: Check specific canvas
      const { data: specificCanvas, error: specificError } = await supabase
        .from("canvases")
        .select("*")
        .eq("user_id", userId)
        .eq("canvas_name", canvasName);

      console.log("Specific canvas query result:", {
        data: specificCanvas,
        error: specificError,
      });

      // Test 3: Check what requesting_user_id() returns
      const { data: userIdResult, error: userIdError } =
        await supabase.rpc("requesting_user_id");

      console.log("requesting_user_id() result:", {
        data: userIdResult,
        error: userIdError,
      });
    } catch (err) {
      console.error("Debug error:", err);
    }
    console.log("=== END DEBUG ===");
  }

  return {
    supabase: enhancedSupabase,
    isReady,
    refreshToken,
    getCurrentToken: () => tokenRef.current,
    debugCanvasAccess,
  };
};
