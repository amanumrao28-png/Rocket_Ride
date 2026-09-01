"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/services/api/auth";
import { SESSION_COOKIE_NAME } from "@/services/auth/serverAuth";
import { Session } from "@/types";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "MANAGER";
  status?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  loginCustomer: (email: string, password: string) => Promise<AuthUser>;
  signUpCustomer: (
    name: string,
    email: string,
    password: string
  ) => Promise<AuthUser>;
  loginManager: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = "warranty_arbiter_access_token";
const SESSION_KEY = "warranty_arbiter_session";

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Save authentication information in sessionStorage & document.cookie.
   */
  const saveAuth = useCallback(
    (authSession: Session, authUser: AuthUser) => {
      try {
        sessionStorage.setItem(
          ACCESS_TOKEN_KEY,
          authSession.token
        );

        sessionStorage.setItem(
          SESSION_KEY,
          JSON.stringify(authSession)
        );

        if (typeof document !== "undefined") {
          document.cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(
            authSession.token
          )}; path=/; max-age=604800; SameSite=Lax`;
        }
      } catch (error) {
        console.error("Failed to save session:", error);
      }

      setUser(authUser);
      setSession(authSession);
    },
    []
  );

  /**
   * Clear authentication state, storage, and cookie.
   */
  const clearAuth = useCallback(() => {
    try {
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
      sessionStorage.removeItem(SESSION_KEY);

      if (typeof document !== "undefined") {
        document.cookie = `${SESSION_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
    } catch (error) {
      console.error("Failed to clear session:", error);
    }

    setUser(null);
    setSession(null);
  }, []);

  /**
   * Restore session when the app starts or route changes.
   */
  const refreshSession = useCallback(async () => {
    setIsLoading(true);

    try {
      let storedToken: string | null = null;

      try {
        storedToken = sessionStorage.getItem(
          ACCESS_TOKEN_KEY
        );

        if (!storedToken && typeof document !== "undefined") {
          const match = document.cookie.match(
            new RegExp(`(?:^|; )${SESSION_COOKIE_NAME}=([^;]*)`)
          );
          if (match) {
            storedToken = decodeURIComponent(match[1]);
          }
        }
      } catch (error) {
        console.error(
          "Could not read access token:",
          error
        );
      }

      /**
       * No token = no authenticated session.
       */
      if (!storedToken) {
        clearAuth();
        return;
      }

      /**
       * Validate token with backend.
       * getSession now sends:
       * Authorization: Bearer <token>
       */
      const state = await authApi.getSession(storedToken);

      if (
        state.authenticated &&
        state.session &&
        state.user
      ) {
        saveAuth(
          state.session,
          state.user as AuthUser
        );
      } else {
        clearAuth();
      }
    } catch (error) {
      console.error(
        "Session refresh failed:",
        error
      );

      clearAuth();
    } finally {
      setIsLoading(false);
    }
  }, [clearAuth, saveAuth]);

  /**
   * Restore an existing session once when provider mounts.
   */
  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  /**
   * Customer login.
   */
  const loginCustomer = async (
    email: string,
    password: string
  ): Promise<AuthUser> => {
    setIsLoading(true);

    try {
      const state = await authApi.loginCustomer(
        email.trim(),
        password
      );

      if (
        !state.authenticated ||
        !state.session ||
        !state.user
      ) {
        throw new Error(
          "Login succeeded but no valid session was returned."
        );
      }

      const authUser = state.user as AuthUser;
      saveAuth(
        state.session,
        authUser
      );
      return authUser;
    } catch (error) {
      clearAuth();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Customer signup helper.
   */
  const signUpCustomer = async (
    name: string,
    email: string,
    password: string
  ): Promise<AuthUser> => {
    setIsLoading(true);

    try {
      const state = await authApi.signUpCustomer(
        name,
        email,
        password
      );

      if (
        !state.authenticated ||
        !state.session ||
        !state.user
      ) {
        throw new Error(
          "Registration succeeded but no valid session was returned."
        );
      }

      const authUser = state.user as AuthUser;
      saveAuth(
        state.session,
        authUser
      );
      return authUser;
    } catch (error) {
      clearAuth();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Manager login.
   */
  const loginManager = async (
    email: string,
    password: string
  ): Promise<AuthUser> => {
    setIsLoading(true);

    try {
      const state = await authApi.loginManager(
        email.trim(),
        password
      );

      if (
        !state.authenticated ||
        !state.session ||
        !state.user
      ) {
        throw new Error(
          "Login succeeded but no valid session was returned."
        );
      }

      const authUser = state.user as AuthUser;
      saveAuth(
        state.session,
        authUser
      );
      return authUser;
    } catch (error) {
      clearAuth();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout.
   */
  const logout = async () => {
    setIsLoading(true);

    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      clearAuth();
      setIsLoading(false);
      router.replace("/");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        loginCustomer,
        signUpCustomer,
        loginManager,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
}