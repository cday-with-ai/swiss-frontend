import axios from "axios";
import { authApi } from "@/lib/api/auth";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("authApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    const loginRequest = {
      username: "testuser",
      password: "password123",
    };

    const mockAuthResponse = {
      accessToken: "access-token-123",
      refreshToken: "refresh-token-456",
      tokenType: "Bearer",
      expiresIn: 86400,
      refreshExpiresIn: 604800,
      user: {
        id: "user-123",
        username: "testuser",
        displayName: "Test User",
      },
    };

    it("should call login endpoint with correct data", async () => {
      mockedAxios.post.mockResolvedValue({
        data: { success: true, data: mockAuthResponse },
      });

      await authApi.login(loginRequest);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:8080/api/v1/auth/login",
        loginRequest
      );
    });

    it("should return auth response data on success", async () => {
      mockedAxios.post.mockResolvedValue({
        data: { success: true, data: mockAuthResponse },
      });

      const result = await authApi.login(loginRequest);

      expect(result).toEqual(mockAuthResponse);
    });

    it("should throw error on failure", async () => {
      const error = new Error("Invalid credentials");
      mockedAxios.post.mockRejectedValue(error);

      await expect(authApi.login(loginRequest)).rejects.toThrow(
        "Invalid credentials"
      );
    });
  });

  describe("register", () => {
    const registerRequest = {
      username: "newuser",
      email: "newuser@example.com",
      password: "password123",
      displayName: "New User",
    };

    const mockRegisterResponse = {
      id: "user-456",
      username: "newuser",
      email: "newuser@example.com",
      displayName: "New User",
    };

    it("should call register endpoint with correct data", async () => {
      mockedAxios.post.mockResolvedValue({
        data: { success: true, data: mockRegisterResponse },
      });

      await authApi.register(registerRequest);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:8080/api/v1/auth/register",
        registerRequest
      );
    });

    it("should return user data on success", async () => {
      mockedAxios.post.mockResolvedValue({
        data: { success: true, data: mockRegisterResponse },
      });

      const result = await authApi.register(registerRequest);

      expect(result).toEqual(mockRegisterResponse);
    });
  });

  describe("refreshToken", () => {
    const refreshToken = "refresh-token-456";
    const mockRefreshResponse = {
      accessToken: "new-access-token-789",
      tokenType: "Bearer",
      expiresIn: 86400,
    };

    it("should call refresh endpoint with refresh token", async () => {
      mockedAxios.post.mockResolvedValue({
        data: { success: true, data: mockRefreshResponse },
      });

      await authApi.refreshToken(refreshToken);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:8080/api/v1/auth/refresh",
        { refreshToken }
      );
    });

    it("should return new access token on success", async () => {
      mockedAxios.post.mockResolvedValue({
        data: { success: true, data: mockRefreshResponse },
      });

      const result = await authApi.refreshToken(refreshToken);

      expect(result).toEqual(mockRefreshResponse);
    });
  });
});
