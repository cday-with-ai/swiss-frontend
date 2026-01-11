import apiClient from "./client";
import {
  ApiResponse,
  Round,
  GenerateRoundRequest,
  UpdateRoundRequest,
  UpdatePairingRequest,
  Pairing,
  StandingsResponse,
} from "@/types/api";

export const roundsApi = {
  list: async (
    tournamentId: string,
    sectionId?: string
  ): Promise<Round[]> => {
    const response = await apiClient.get<ApiResponse<Round[]>>(
      `/tournament/${tournamentId}/round`,
      { params: sectionId ? { sectionId } : undefined }
    );
    return response.data.data;
  },

  get: async (tournamentId: string, roundId: string): Promise<Round> => {
    const response = await apiClient.get<ApiResponse<Round>>(
      `/tournament/${tournamentId}/round/${roundId}`
    );
    return response.data.data;
  },

  generate: async (
    tournamentId: string,
    data?: GenerateRoundRequest
  ): Promise<Round> => {
    const response = await apiClient.post<ApiResponse<Round>>(
      `/tournament/${tournamentId}/round`,
      data || {}
    );
    return response.data.data;
  },

  update: async (
    tournamentId: string,
    roundId: string,
    data: UpdateRoundRequest
  ): Promise<Round> => {
    const response = await apiClient.put<ApiResponse<Round>>(
      `/tournament/${tournamentId}/round/${roundId}`,
      data
    );
    return response.data.data;
  },

  updatePairing: async (
    tournamentId: string,
    roundId: string,
    pairingId: string,
    data: UpdatePairingRequest
  ): Promise<Pairing> => {
    const response = await apiClient.put<ApiResponse<Pairing>>(
      `/tournament/${tournamentId}/round/${roundId}/pairing/${pairingId}`,
      data
    );
    return response.data.data;
  },

  delete: async (
    tournamentId: string,
    roundId: string,
    force?: boolean
  ): Promise<void> => {
    await apiClient.delete(
      `/tournament/${tournamentId}/round/${roundId}`,
      { params: force ? { force: true } : undefined }
    );
  },

  getStandings: async (
    tournamentId: string,
    sectionId?: string
  ): Promise<StandingsResponse> => {
    const response = await apiClient.get<ApiResponse<StandingsResponse>>(
      `/tournament/${tournamentId}/round/standings`,
      { params: sectionId ? { sectionId } : undefined }
    );
    return response.data.data;
  },
};
