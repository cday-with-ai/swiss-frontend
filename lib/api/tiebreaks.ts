import apiClient from "./client";
import {
  ApiResponse,
  TieBreakConfigResponse,
  UpdateTieBreakRequest,
} from "@/types/api";

export const tiebreaksApi = {
  get: async (tournamentId: string): Promise<TieBreakConfigResponse> => {
    const response = await apiClient.get<ApiResponse<TieBreakConfigResponse>>(
      `/tournament/${tournamentId}/tiebreak`
    );
    return response.data.data;
  },

  update: async (
    tournamentId: string,
    data: UpdateTieBreakRequest
  ): Promise<TieBreakConfigResponse> => {
    const response = await apiClient.put<ApiResponse<TieBreakConfigResponse>>(
      `/tournament/${tournamentId}/tiebreak`,
      data
    );
    return response.data.data;
  },
};
