import { tiebreaksApi } from "@/lib/api/tiebreaks";
import apiClient from "@/lib/api/client";

jest.mock("@/lib/api/client");
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe("tiebreaksApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const tournamentId = "tournament-123";

  const mockTieBreakConfig = {
    tournamentId: "tournament-123",
    tieBreakMethods: ["BUCHHOLZ_CUT_1", "BUCHHOLZ", "SONNEBORN_BERGER"],
    availableMethods: [
      "BUCHHOLZ",
      "BUCHHOLZ_CUT_1",
      "MEDIAN_BUCHHOLZ",
      "SONNEBORN_BERGER",
      "PROGRESSIVE",
      "CUMULATIVE",
      "HEAD_TO_HEAD",
      "WINS",
      "GAMES_AS_BLACK",
    ],
  };

  describe("get", () => {
    it("should fetch tiebreak configuration", async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { data: mockTieBreakConfig },
      });

      const result = await tiebreaksApi.get(tournamentId);

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        `/tournament/${tournamentId}/tiebreak`
      );
      expect(result).toEqual(mockTieBreakConfig);
      expect(result.tieBreakMethods).toHaveLength(3);
    });
  });

  describe("update", () => {
    it("should update tiebreak configuration", async () => {
      const updateRequest = {
        tieBreakMethods: [
          "MEDIAN_BUCHHOLZ",
          "PROGRESSIVE",
          "HEAD_TO_HEAD",
          "WINS",
        ],
      };

      const updatedConfig = {
        ...mockTieBreakConfig,
        tieBreakMethods: updateRequest.tieBreakMethods,
      };

      mockedApiClient.put.mockResolvedValue({
        data: { data: updatedConfig },
      });

      const result = await tiebreaksApi.update(tournamentId, updateRequest);

      expect(mockedApiClient.put).toHaveBeenCalledWith(
        `/tournament/${tournamentId}/tiebreak`,
        updateRequest
      );
      expect(result.tieBreakMethods).toEqual(updateRequest.tieBreakMethods);
      expect(result.tieBreakMethods).toHaveLength(4);
    });
  });
});
