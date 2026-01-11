import { playersApi } from "@/lib/api/players";
import apiClient from "@/lib/api/client";

jest.mock("@/lib/api/client");
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe("playersApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const tournamentId = "tournament-123";

  const mockPlayer = {
    id: "player-123",
    tournamentId: "tournament-123",
    sectionId: "section-456",
    name: "Magnus Carlsen",
    mainRating: 2830,
    title: "GM",
    active: true,
    keepInScoreGroup: true,
    feePaid: true,
    totalScore: 3.5,
    colorDifference: 1,
    consecutiveSameColor: 0,
    receivedBye: false,
    pairingNumber: 1,
    byes: [],
    opponentIds: [],
    createdAt: "2025-01-10T08:00:00Z",
    updatedAt: "2025-01-10T08:00:00Z",
  };

  describe("list", () => {
    it("should fetch players for tournament", async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          data: {
            content: [mockPlayer],
            page: 0,
            size: 50,
            totalElements: 1,
            totalPages: 1,
            first: true,
            last: true,
          },
        },
      });

      const result = await playersApi.list(tournamentId);

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        `/tournament/${tournamentId}/player`,
        { params: undefined }
      );
      expect(result.content).toHaveLength(1);
    });

    it("should pass filter params", async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { data: { content: [] } },
      });

      await playersApi.list(tournamentId, {
        sectionId: "section-456",
        active: true,
        page: 0,
        size: 100,
      });

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        `/tournament/${tournamentId}/player`,
        {
          params: { sectionId: "section-456", active: true, page: 0, size: 100 },
        }
      );
    });
  });

  describe("get", () => {
    it("should fetch player by id", async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { data: mockPlayer },
      });

      const result = await playersApi.get(tournamentId, "player-123");

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        `/tournament/${tournamentId}/player/player-123`
      );
      expect(result).toEqual(mockPlayer);
    });
  });

  describe("create", () => {
    it("should create player", async () => {
      const createRequest = {
        name: "Fabiano Caruana",
        mainRating: 2805,
        title: "GM",
        sectionId: "section-456",
      };

      mockedApiClient.post.mockResolvedValue({
        data: { data: { ...mockPlayer, ...createRequest, id: "player-new" } },
      });

      const result = await playersApi.create(tournamentId, createRequest);

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        `/tournament/${tournamentId}/player`,
        createRequest
      );
      expect(result.name).toBe("Fabiano Caruana");
    });
  });

  describe("bulkImport", () => {
    it("should bulk import players", async () => {
      const bulkRequest = {
        players: [
          { name: "Player 1", mainRating: 2000 },
          { name: "Player 2", mainRating: 1900 },
        ],
        skipDuplicates: true,
      };

      const mockBulkResponse = {
        imported: 2,
        skipped: 0,
        failed: 0,
        players: [
          { id: "p1", name: "Player 1", pairingNumber: 1 },
          { id: "p2", name: "Player 2", pairingNumber: 2 },
        ],
        errors: [],
      };

      mockedApiClient.post.mockResolvedValue({
        data: { data: mockBulkResponse },
      });

      const result = await playersApi.bulkImport(tournamentId, bulkRequest);

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        `/tournament/${tournamentId}/player/bulk`,
        bulkRequest
      );
      expect(result.imported).toBe(2);
    });
  });

  describe("update", () => {
    it("should update player", async () => {
      const updateRequest = {
        mainRating: 2835,
        feePaid: true,
      };

      mockedApiClient.put.mockResolvedValue({
        data: { data: { ...mockPlayer, ...updateRequest } },
      });

      const result = await playersApi.update(
        tournamentId,
        "player-123",
        updateRequest
      );

      expect(mockedApiClient.put).toHaveBeenCalledWith(
        `/tournament/${tournamentId}/player/player-123`,
        updateRequest
      );
      expect(result.mainRating).toBe(2835);
    });
  });

  describe("delete", () => {
    it("should delete player", async () => {
      mockedApiClient.delete.mockResolvedValue({});

      await playersApi.delete(tournamentId, "player-123");

      expect(mockedApiClient.delete).toHaveBeenCalledWith(
        `/tournament/${tournamentId}/player/player-123`
      );
    });
  });

  describe("assignBye", () => {
    it("should assign bye to player", async () => {
      const byeRequest = {
        roundNumber: 3,
        byeValue: 0.5 as const,
      };

      mockedApiClient.post.mockResolvedValue({
        data: {
          data: {
            ...mockPlayer,
            byes: [{ roundNumber: 3, byeValue: 0.5, reason: "REQUESTED" }],
          },
        },
      });

      const result = await playersApi.assignBye(
        tournamentId,
        "player-123",
        byeRequest
      );

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        `/tournament/${tournamentId}/player/player-123/assignBye`,
        byeRequest
      );
      expect(result.byes).toHaveLength(1);
    });
  });
});
