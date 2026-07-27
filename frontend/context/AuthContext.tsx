"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import type { ProfileUpdate, User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  updateProfile: (payload: ProfileUpdate) => Promise<User>;
  deleteAccount: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // With httpOnly cookies the token isn't readable here; ask the server who we are.
    api
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const u = await api.login({ email, password });
    setUser(u);
  }

  async function signup(username: string, email: string, password: string) {
    const u = await api.signup({ username, email, password });
    setUser(u);
  }

  async function updateProfile(payload: ProfileUpdate) {
    const updated = await api.updateProfile(payload);
    setUser(updated);
    return updated;
  }

  async function deleteAccount() {
    await api.deleteAccount();
    setUser(null);
  }

  async function logout() {
    try {
      await api.logout();
    } catch {
      /* ignore network errors on logout */
    }
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        updateProfile,
        deleteAccount,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}