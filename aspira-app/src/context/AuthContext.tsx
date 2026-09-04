// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { api } from "../stats/api/axios";

interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasAttemptedRefresh = useRef(false);

  useEffect(() => {
    if (hasAttemptedRefresh.current) return;
    hasAttemptedRefresh.current = true;
    api.post("/auth/refresh")
      .then((res) => setAccessToken(res.data.accessToken))
      .catch(() => setAccessToken(null))
      .finally(() => setIsLoading(false));
  }, []);

  // Clears auth state regardless of whether the server call succeeds —
  // the user's intent ("log me out") is achievable client-side even if
  // the network request fails or the cookie was already gone.
  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch {
      // Same reasoning as the backend: a failed logout call shouldn't
      // block the user from being logged out on the client.
    } finally {
      setAccessToken(null);
    }
  }

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}