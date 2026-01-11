import { roundsApi } from "@/lib/api/rounds";
import apiClient from "@/lib/api/client";

jest.mock("@/lib/api/client");
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe("roundsApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const tournamentId = "tournament-123";
  const sectionId = "section-456";
  const roundId = "round-789";

  const mockRound = {
    id: "round-789",
    tournamentId: "tournament-123",
    sectionId: "section-456",
    roundNumber: 1,
    status: "PAIRED" as const,
    pairings: [
      {
        id: "p1",
        boardNumber: 1,
        whitePlayerId: "player-1",
        whitePlayerName: "Magnus Carlsen",
        whitePlayerRating: 2830,
        whitePlayerTitle: "GM",
        blackPlayerId: "player-2",
        blackPlayerName: "Fabiano Caruana",
        blackPlayerRating: 2805,
        blackPlayerTitle: "GM",
        result: "NOT_STARTED" as const,
        isFloatPairing: false,
      },
    ],
    byePlayerId: null,
    byePlayerName: null,
    byeValue: null,
    pairingTime: "2025-01-15T09:00:00Z",
    createdAt: "2025-01-15T09:00:00Z",
    updatedAt: "2025-01-15T09:00:00Z",
  };

  describe("list", () => {
    it("should fetch rounds for tournament", async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { data: [mockRound] },
      });

      const result = await roundsApi.list(tournamentId);

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        `/tournament/${tournamentId}/round`,
        { params: undefined }
      );
      expect(result).toHaveLength(1);
    });

    it("should pass sectionId param", async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { data: [mockRound] },
      });

      await roundsApi.list(tournamentId, sectionId);

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        `/tournament/${tournamentId}/round`,
        { params: { sectionId } }
      );
    });
  });

  describe("get", () => {
    it("should fetch round by id", async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { data: mockRound },
      });

      const result = await roundsApi.get(tournamentId, roundId);

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        `/tournament/${tournamentId}/round/${roundId}`
      );
      expect(result).toEqual(mockRound);
    });
  });

  describe("generate", () => {
    it("should generate new round", async () => {
      const newRound = { ...mockRound, roundNumber: 2 };

      mockedApiClient.post.mockResolvedValue({
        data: { data: newRound },
      });

      const result = await roundsApi.generate(tournamentId, { sectionId });

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        `/tournament/${tournamentId}/round`,
        { sectionId }
      );
      expect(result.roundNumber).toBe(2);
    });

    it("should generate round without sectionId for single-section tournaments", async () => {
      mockedApiClient.post.mockResolvedValue({
        data: { data: mockRound },
      });

      await roundsApi.generate(tournamentId);

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        `/tournament/${tournamentId}/round`,
        {}
      );
    });
  });

  describe("update", () => {
    it("should update round with results", async () => {
      const updateRequest = {
        status: "IN_PROGRESS" as const,
        pairings: [{ id: "p1", result: "WHITE_WINS" as const }],
      };

      const updatedRound = {
        ...mockRound,
        status: "IN_PROGRESS",
        pairings: [{ ...mockRound.pairings[0], result: "WHITE_WINS" }],
      };

      mockedApiClient.put.mockResolvedValue({
        data: { data: updatedRound },
      });

      const result = await roundsApi.update(tournamentId, roundId, updateRequest);

      expect(mockedApiClient.put).toHaveBeenCalledWith(
        `/tournament/${tournamentId}/round/${roundId}`,
        updateRequest
      );
      expect(result.status).toBe("IN_PROGRESS");
    });
  });

  describe("updatePairing", () => {
    it("should update single pairing result", async () => {
      const pairingId = "p1";
      const updateRequest = { result: "WHITE_WINS" as const };

      const updatedPairing = {
        ...mockRound.pairings[0],
        result: "WHITE_WINS",
        whiteScoreAfter: 1.0,
        blackScoreAfter: 0.0,
      };

      mockedApiClient.put.mockResolvedValue({
        data: { data: updatedPairing },
      });

      const result = await roundsApi.updatePairing(
        tournamentId,
        roundId,
        pairingId,
        updateRequest
      );

      expect(mockedApiClient.put).toHaveBeenCalledWith(
        `/tournament/${tournamentId}/round/${roundId}/pairing/${pairingId}`,
        updateRequest
      );
      expect(result.result).toBe("WHITE_WINS");
    });
  });

  describe("delete", () => {
    it("should delete round", async () => {
      mockedApiClient.delete.mockResolvedValue({});

      await roundsApi.delete(tournamentId, roundId);

      expect(mockedApiClient.delete).toHaveBeenCalledWith(
        `/tournament/${tournamentId}/round/${roundId}`,
        { params: undefined }
      );
    });

    it("should force delete round with completed games", async () => {
      mockedApiClient.delete.mockResolvedValue({});

      await roundsApi.delete(tournamentId, roundId, true);

      expect(mockedApiClient.delete).toHaveBeenCalledWith(
        `/tournament/${tournamentId}/round/${roundId}`,
        { params: { force: true } }
      );
    });
  });

  describe("getStandings", () => {
    it("should fetch standings", async () => {
      const mockStandings = {
        tournamentId: "tournament-123",
        sectionId: "section-456",
        sectionName: "Open Section",
        roundNumber: 3,
        totalRounds: 5,
        standings: [
          {
            rank: 1,
            playerId: "player-1",
            playerName: "Magnus Carlsen",
            title: "GM",
            rating: 2830,
            score: 3.0,
            tiebreaks: { BUCHHOLZ_CUT_1: 7.5 },
            results: [{ round: 1, result: "W", color: "W" }],
            colorHistory: ["W"],
            opponents: ["Player X"],
          },
        ],
        generatedAt: "2025-01-16T14:35:00Z",
      };

      mockedApiClient.get.mockResolvedValue({
        data: { data: mockStandings },
      });

      const result = await roundsApi.getStandings(tournamentId, sectionId);

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        `/tournament/${tournamentId}/round/standings`,
        { params: { sectionId } }
      );
      expect(result.standings).toHaveLength(1);
    });
  });
});
