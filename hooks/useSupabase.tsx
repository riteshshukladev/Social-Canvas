// hooks/useSupabase.js - FIXED VERSION
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

        // Update Supabase client with new token
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

    refreshIntervalRef.current = setInterval(async () => {
      console.log("Refreshing JWT token...");
      await refreshToken();
    }, 45000);

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

  // Enhanced supabase client with auto-retry on token expiry
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

  return {
    supabase: enhancedSupabase,
    isReady,
    refreshToken,
    getCurrentToken: () => tokenRef.current,
  };
};
