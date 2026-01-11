import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

interface User {
  id: string;
  username: string;
  displayName: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setTokens: (accessToken: string, refreshToken: string, user: User) => Promise<void>;
  clearTokens: () => Promise<void>;
  loadTokens: () => Promise<void>;
  setAccessToken: (accessToken: string) => Promise<void>;
}

const TOKEN_KEY = "auth_tokens";

// Helper for web storage fallback
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setTokens: async (accessToken, refreshToken, user) => {
    const data = JSON.stringify({ accessToken, refreshToken, user });
    await storage.setItem(TOKEN_KEY, data);
    set({
      accessToken,
      refreshToken,
      user,
      isAuthenticated: true,
    });
  },

  clearTokens: async () => {
    await storage.removeItem(TOKEN_KEY);
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    });
  },

  loadTokens: async () => {
    try {
      const data = await storage.getItem(TOKEN_KEY);
      if (data) {
        const { accessToken, refreshToken, user } = JSON.parse(data);
        set({
          accessToken,
          refreshToken,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Failed to load tokens:", error);
      set({ isLoading: false });
    }
  },

  setAccessToken: async (accessToken) => {
    const { refreshToken, user } = get();
    if (refreshToken && user) {
      const data = JSON.stringify({ accessToken, refreshToken, user });
      await storage.setItem(TOKEN_KEY, data);
    }
    set({ accessToken });
  },
}));
