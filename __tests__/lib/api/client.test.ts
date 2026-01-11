import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { apiClient } from "@/lib/api/client";
import { useAuthStore } from "@/stores/auth";

// Mock expo-router
jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
  },
}));

// Mock react-native Platform
jest.mock("react-native", () => ({
  Platform: {
    OS: "ios",
    select: jest.fn((obj) => obj.ios || obj.default),
  },
}));

import { router } from "expo-router";

describe("apiClient", () => {
  let mockApiClient: MockAdapter;
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockApiClient = new MockAdapter(apiClient);
    mockAxios = new MockAdapter(axios);
    // Reset auth store
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockApiClient.restore();
    mockAxios.restore();
  });

  describe("request interceptor", () => {
    it("should add Authorization header when access token exists", async () => {
      useAuthStore.setState({ accessToken: "test-token" });
      mockApiClient.onGet("/test").reply(200, { data: "success" });

      await apiClient.get("/test");

      expect(mockApiClient.history.get[0].headers?.Authorization).toBe(
        "Bearer test-token"
      );
    });

    it("should not add Authorization header when no access token", async () => {
      mockApiClient.onGet("/test").reply(200, { data: "success" });

      await apiClient.get("/test");

      expect(
        mockApiClient.history.get[0].headers?.Authorization
      ).toBeUndefined();
    });
  });

  describe("response interceptor", () => {
    it("should pass through successful responses", async () => {
      mockApiClient.onGet("/test").reply(200, { data: "success" });

      const response = await apiClient.get("/test");

      expect(response.data).toEqual({ data: "success" });
    });

    it("should refresh token on 401 and retry request", async () => {
      const mockUser = { id: "1", username: "test", displayName: "Test" };
      useAuthStore.setState({
        accessToken: "old-token",
        refreshToken: "refresh-token",
        user: mockUser,
        isAuthenticated: true,
      });

      // First request fails with 401
      mockApiClient.onGet("/protected").replyOnce(401);
      // Refresh token request succeeds (uses axios directly, not apiClient)
      mockAxios
        .onPost("http://localhost:8080/api/v1/auth/refresh")
        .reply(200, {
          data: { accessToken: "new-token" },
        });
      // Retry succeeds
      mockApiClient.onGet("/protected").reply(200, { data: "protected-data" });

      const response = await apiClient.get("/protected");

      expect(response.data).toEqual({ data: "protected-data" });
      expect(useAuthStore.getState().accessToken).toBe("new-token");
    });

    it("should redirect to login when refresh token fails", async () => {
      const mockUser = { id: "1", username: "test", displayName: "Test" };
      useAuthStore.setState({
        accessToken: "old-token",
        refreshToken: "refresh-token",
        user: mockUser,
        isAuthenticated: true,
      });

      // First request fails with 401
      mockApiClient.onGet("/protected").replyOnce(401);
      // Refresh token request fails
      mockAxios
        .onPost("http://localhost:8080/api/v1/auth/refresh")
        .reply(401);

      await expect(apiClient.get("/protected")).rejects.toThrow();

      expect(router.replace).toHaveBeenCalledWith("/(auth)/login");
      expect(useAuthStore.getState().accessToken).toBeNull();
    });

    it("should redirect to login when no refresh token available", async () => {
      useAuthStore.setState({
        accessToken: "old-token",
        refreshToken: null,
        user: null,
        isAuthenticated: true,
      });

      mockApiClient.onGet("/protected").reply(401);

      await expect(apiClient.get("/protected")).rejects.toThrow();

      expect(router.replace).toHaveBeenCalledWith("/(auth)/login");
    });

    it("should not retry on non-401 errors", async () => {
      mockApiClient.onGet("/test").reply(500, { error: "Server error" });

      await expect(apiClient.get("/test")).rejects.toThrow();

      // Should only make one request
      expect(mockApiClient.history.get.length).toBe(1);
    });
  });
});
