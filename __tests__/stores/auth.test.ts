// Mock react-native Platform before imports
jest.mock("react-native", () => ({
  Platform: {
    OS: "ios",
    select: jest.fn((obj) => obj.ios || obj.default),
  },
}));

import { renderHook, act } from "@testing-library/react-native";
import * as SecureStore from "expo-secure-store";
import { useAuthStore } from "@/stores/auth";

// Reset store before each test
beforeEach(() => {
  useAuthStore.setState({
    accessToken: null,
    refreshToken: null,
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });
  jest.clearAllMocks();
});

describe("useAuthStore", () => {
  const mockUser = {
    id: "user-123",
    username: "testuser",
    displayName: "Test User",
  };

  const mockTokens = {
    accessToken: "access-token-123",
    refreshToken: "refresh-token-456",
  };

  describe("initial state", () => {
    it("should have correct initial state", () => {
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.accessToken).toBeNull();
      expect(result.current.refreshToken).toBeNull();
      expect(result.current.user).toBeNull();
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("setTokens", () => {
    it("should set tokens and user correctly", async () => {
      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.setTokens(
          mockTokens.accessToken,
          mockTokens.refreshToken,
          mockUser
        );
      });

      expect(result.current.accessToken).toBe(mockTokens.accessToken);
      expect(result.current.refreshToken).toBe(mockTokens.refreshToken);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("should persist tokens to storage", async () => {
      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.setTokens(
          mockTokens.accessToken,
          mockTokens.refreshToken,
          mockUser
        );
      });

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "auth_tokens",
        JSON.stringify({
          accessToken: mockTokens.accessToken,
          refreshToken: mockTokens.refreshToken,
          user: mockUser,
        })
      );
    });
  });

  describe("clearTokens", () => {
    it("should clear all auth state", async () => {
      const { result } = renderHook(() => useAuthStore());

      // First set some tokens
      await act(async () => {
        await result.current.setTokens(
          mockTokens.accessToken,
          mockTokens.refreshToken,
          mockUser
        );
      });

      // Then clear them
      await act(async () => {
        await result.current.clearTokens();
      });

      expect(result.current.accessToken).toBeNull();
      expect(result.current.refreshToken).toBeNull();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("should remove tokens from storage", async () => {
      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.clearTokens();
      });

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("auth_tokens");
    });
  });

  describe("loadTokens", () => {
    it("should load tokens from storage when they exist", async () => {
      const storedData = JSON.stringify({
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        user: mockUser,
      });

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(storedData);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.loadTokens();
      });

      expect(result.current.accessToken).toBe(mockTokens.accessToken);
      expect(result.current.refreshToken).toBe(mockTokens.refreshToken);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it("should set isLoading to false when no tokens exist", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.loadTokens();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("should handle storage errors gracefully", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(
        new Error("Storage error")
      );

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.loadTokens();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("setAccessToken", () => {
    it("should update access token", async () => {
      const { result } = renderHook(() => useAuthStore());

      // First set initial tokens
      await act(async () => {
        await result.current.setTokens(
          mockTokens.accessToken,
          mockTokens.refreshToken,
          mockUser
        );
      });

      const newAccessToken = "new-access-token-789";

      await act(async () => {
        await result.current.setAccessToken(newAccessToken);
      });

      expect(result.current.accessToken).toBe(newAccessToken);
    });

    it("should persist updated access token to storage", async () => {
      const { result } = renderHook(() => useAuthStore());

      // First set initial tokens
      await act(async () => {
        await result.current.setTokens(
          mockTokens.accessToken,
          mockTokens.refreshToken,
          mockUser
        );
      });

      jest.clearAllMocks();

      const newAccessToken = "new-access-token-789";

      await act(async () => {
        await result.current.setAccessToken(newAccessToken);
      });

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "auth_tokens",
        JSON.stringify({
          accessToken: newAccessToken,
          refreshToken: mockTokens.refreshToken,
          user: mockUser,
        })
      );
    });

    it("should not persist if no refresh token exists", async () => {
      const { result } = renderHook(() => useAuthStore());

      jest.clearAllMocks();

      await act(async () => {
        await result.current.setAccessToken("new-token");
      });

      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });
  });
});
