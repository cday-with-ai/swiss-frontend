import axios from "axios";
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ApiResponse,
  User,
} from "@/types/api";

// Use a separate axios instance for auth (no interceptors needed)
const BASE_URL = "http://localhost:8080/api/v1";

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axios.post<ApiResponse<AuthResponse>>(
      `${BASE_URL}/auth/login`,
      data
    );
    return response.data.data;
  },

  register: async (
    data: RegisterRequest
  ): Promise<{ id: string; username: string; email: string; displayName: string }> => {
    const response = await axios.post<
      ApiResponse<{ id: string; username: string; email: string; displayName: string }>
    >(`${BASE_URL}/auth/register`, data);
    return response.data.data;
  },

  refreshToken: async (
    refreshToken: string
  ): Promise<{ accessToken: string; tokenType: string; expiresIn: number }> => {
    const response = await axios.post<
      ApiResponse<{ accessToken: string; tokenType: string; expiresIn: number }>
    >(`${BASE_URL}/auth/refresh`, { refreshToken });
    return response.data.data;
  },
};
