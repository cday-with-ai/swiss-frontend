import { sectionsApi } from "@/lib/api/sections";
import apiClient from "@/lib/api/client";

jest.mock("@/lib/api/client");
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe("sectionsApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const tournamentId = "tournament-123";
  const sectionId = "section-456";

  const mockSection = {
    id: "section-456",
    tournamentId: "tournament-123",
    name: "Open Section",
    shortName: "Open",
    boardNumber: 1,
    boardSpacing: 1,
    rounds: 5,
    timeControl: "G/90+30",
    sectionType: "INDIVIDUAL" as const,
    gamesPerRound: 1,
    usChessRated: true,
    fideRatable: false,
    useTieBreaks: true,
    currentRound: 0,
    playerCount: 25,
    createdAt: "2025-01-10T08:00:00Z",
    updatedAt: "2025-01-10T08:00:00Z",
  };

  describe("list", () => {
    it("should fetch all sections for a tournament", async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { data: [mockSection] },
      });

      const result = await sectionsApi.list(tournamentId);

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        `/tournament/${tournamentId}/section`
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockSection);
    });
  });

  describe("get", () => {
    it("should fetch a section by id", async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { data: mockSection },
      });

      const result = await sectionsApi.get(tournamentId, sectionId);

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        `/tournament/${tournamentId}/section/${sectionId}`
      );
      expect(result).toEqual(mockSection);
    });
  });

  describe("create", () => {
    it("should create a new section", async () => {
      const createRequest = {
        name: "Under 1800",
        shortName: "U1800",
        rounds: 4,
        timeControl: "G/60+15",
      };

      const newSection = {
        ...mockSection,
        id: "section-new",
        name: "Under 1800",
        shortName: "U1800",
        rounds: 4,
        timeControl: "G/60+15",
      };

      mockedApiClient.post.mockResolvedValue({
        data: { data: newSection },
      });

      const result = await sectionsApi.create(tournamentId, createRequest);

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        `/tournament/${tournamentId}/section`,
        createRequest
      );
      expect(result.name).toBe("Under 1800");
    });
  });

  describe("update", () => {
    it("should update a section", async () => {
      const updateRequest = {
        name: "Open Championship",
        rounds: 7,
      };

      const updatedSection = {
        ...mockSection,
        name: "Open Championship",
        rounds: 7,
      };

      mockedApiClient.put.mockResolvedValue({
        data: { data: updatedSection },
      });

      const result = await sectionsApi.update(
        tournamentId,
        sectionId,
        updateRequest
      );

      expect(mockedApiClient.put).toHaveBeenCalledWith(
        `/tournament/${tournamentId}/section/${sectionId}`,
        updateRequest
      );
      expect(result.name).toBe("Open Championship");
      expect(result.rounds).toBe(7);
    });
  });

  describe("delete", () => {
    it("should delete a section", async () => {
      mockedApiClient.delete.mockResolvedValue({});

      await sectionsApi.delete(tournamentId, sectionId);

      expect(mockedApiClient.delete).toHaveBeenCalledWith(
        `/tournament/${tournamentId}/section/${sectionId}`
      );
    });
  });
});
