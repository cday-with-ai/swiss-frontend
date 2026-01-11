import apiClient from "./client";
import {
  ApiResponse,
  PagedResponse,
  Player,
  CreatePlayerRequest,
  UpdatePlayerRequest,
  AssignByeRequest,
  BulkImportRequest,
  BulkImportResponse,
} from "@/types/api";

export const playersApi = {
  list: async (
    tournamentId: string,
    params?: {
      sectionId?: string;
      active?: boolean;
      page?: number;
      size?: number;
      sort?: string;
      view?: "summary" | "list" | "full";
    }
  ): Promise<PagedResponse<Player>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<Player>>>(
      `/tournament/${tournamentId}/player`,
      { params }
    );
    return response.data.data;
  },

  get: async (tournamentId: string, playerId: string): Promise<Player> => {
    const response = await apiClient.get<ApiResponse<Player>>(
      `/tournament/${tournamentId}/player/${playerId}`
    );
    return response.data.data;
  },

  create: async (
    tournamentId: string,
    data: CreatePlayerRequest
  ): Promise<Player> => {
    const response = await apiClient.post<ApiResponse<Player>>(
      `/tournament/${tournamentId}/player`,
      data
    );
    return response.data.data;
  },

  bulkImport: async (
    tournamentId: string,
    data: BulkImportRequest
  ): Promise<BulkImportResponse> => {
    const response = await apiClient.post<ApiResponse<BulkImportResponse>>(
      `/tournament/${tournamentId}/player/bulk`,
      data
    );
    return response.data.data;
  },

  update: async (
    tournamentId: string,
    playerId: string,
    data: UpdatePlayerRequest
  ): Promise<Player> => {
    const response = await apiClient.put<ApiResponse<Player>>(
      `/tournament/${tournamentId}/player/${playerId}`,
      data
    );
    return response.data.data;
  },

  delete: async (tournamentId: string, playerId: string): Promise<void> => {
    await apiClient.delete(`/tournament/${tournamentId}/player/${playerId}`);
  },

  assignBye: async (
    tournamentId: string,
    playerId: string,
    data: AssignByeRequest
  ): Promise<Player> => {
    const response = await apiClient.post<ApiResponse<Player>>(
      `/tournament/${tournamentId}/player/${playerId}/assignBye`,
      data
    );
    return response.data.data;
  },
};
