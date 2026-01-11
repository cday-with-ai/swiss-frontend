import apiClient from "./client";
import {
  ApiResponse,
  PagedResponse,
  Tournament,
  TournamentDetail,
  CreateTournamentRequest,
  UpdateTournamentRequest,
} from "@/types/api";

export const tournamentsApi = {
  list: async (params?: {
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<PagedResponse<Tournament>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<Tournament>>>(
      "/tournament",
      { params }
    );
    return response.data.data;
  },

  get: async (id: string): Promise<TournamentDetail> => {
    const response = await apiClient.get<ApiResponse<TournamentDetail>>(
      `/tournament/${id}`
    );
    return response.data.data;
  },

  create: async (data: CreateTournamentRequest): Promise<Tournament> => {
    const response = await apiClient.post<ApiResponse<Tournament>>(
      "/tournament",
      data
    );
    return response.data.data;
  },

  update: async (
    id: string,
    data: UpdateTournamentRequest
  ): Promise<Tournament> => {
    const response = await apiClient.put<ApiResponse<Tournament>>(
      `/tournament/${id}`,
      data
    );
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tournament/${id}`);
  },
};
