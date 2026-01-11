import apiClient from "./client";
import {
  ApiResponse,
  Section,
  CreateSectionRequest,
  UpdateSectionRequest,
} from "@/types/api";

export const sectionsApi = {
  list: async (tournamentId: string): Promise<Section[]> => {
    const response = await apiClient.get<ApiResponse<Section[]>>(
      `/tournament/${tournamentId}/section`
    );
    return response.data.data;
  },

  get: async (tournamentId: string, sectionId: string): Promise<Section> => {
    const response = await apiClient.get<ApiResponse<Section>>(
      `/tournament/${tournamentId}/section/${sectionId}`
    );
    return response.data.data;
  },

  create: async (
    tournamentId: string,
    data: CreateSectionRequest
  ): Promise<Section> => {
    const response = await apiClient.post<ApiResponse<Section>>(
      `/tournament/${tournamentId}/section`,
      data
    );
    return response.data.data;
  },

  update: async (
    tournamentId: string,
    sectionId: string,
    data: UpdateSectionRequest
  ): Promise<Section> => {
    const response = await apiClient.put<ApiResponse<Section>>(
      `/tournament/${tournamentId}/section/${sectionId}`,
      data
    );
    return response.data.data;
  },

  delete: async (tournamentId: string, sectionId: string): Promise<void> => {
    await apiClient.delete(`/tournament/${tournamentId}/section/${sectionId}`);
  },
};
