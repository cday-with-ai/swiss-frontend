// Mock react-native Platform before imports
jest.mock("react-native", () => ({
  Platform: {
    OS: "ios",
    select: jest.fn((obj) => obj.ios || obj.default),
  },
}));

// Test that barrel exports work correctly
import { useAuthStore } from "@/stores";

describe("Stores barrel exports", () => {
  it("should export useAuthStore", () => {
    expect(useAuthStore).toBeDefined();
    expect(typeof useAuthStore).toBe("function");
  });

  it("should have expected state properties", () => {
    const state = useAuthStore.getState();
    expect(state).toHaveProperty("accessToken");
    expect(state).toHaveProperty("refreshToken");
    expect(state).toHaveProperty("user");
    expect(state).toHaveProperty("isLoading");
    expect(state).toHaveProperty("isAuthenticated");
  });

  it("should have expected actions", () => {
    const state = useAuthStore.getState();
    expect(typeof state.setTokens).toBe("function");
    expect(typeof state.clearTokens).toBe("function");
    expect(typeof state.loadTokens).toBe("function");
    expect(typeof state.setAccessToken).toBe("function");
  });
});
