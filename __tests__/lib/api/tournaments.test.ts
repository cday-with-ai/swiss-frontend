import { tournamentsApi } from "@/lib/api/tournaments";
import apiClient from "@/lib/api/client";

jest.mock("@/lib/api/client");
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe("tournamentsApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockTournament = {
    id: "tournament-123",
    name: "Winter Open 2025",
    description: "Annual winter tournament",
    eventDates: ["2025-01-15", "2025-01-16"],
    tieBreaks: ["BUCHHOLZ_CUT_1", "BUCHHOLZ", "SONNEBORN_BERGER"],
    directors: [{ name: "Jane Smith", uscfId: "12345678", fideId: null }],
    createdAt: "2025-01-01T10:00:00Z",
    updatedAt: "2025-01-01T10:00:00Z",
  };

  const mockTournamentDetail = {
    ...mockTournament,
    sectionCount: 2,
    playerCount: 48,
    roundCount: 5,
  };

  describe("list", () => {
    it("should fetch tournaments with default params", async () => {
      const mockResponse = {
        data: {
          data: {
            content: [mockTournament],
            page: 0,
            size: 20,
            totalElements: 1,
            totalPages: 1,
            first: true,
            last: true,
          },
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);

      const result = await tournamentsApi.list();

      expect(mockedApiClient.get).toHaveBeenCalledWith("/tournament", {
        params: undefined,
      });
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toEqual(mockTournament);
    });

    it("should pass pagination params", async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { data: { content: [], page: 1, size: 10 } },
      });

      await tournamentsApi.list({ page: 1, size: 10, sort: "name,asc" });

      expect(mockedApiClient.get).toHaveBeenCalledWith("/tournament", {
        params: { page: 1, size: 10, sort: "name,asc" },
      });
    });
  });

  describe("get", () => {
    it("should fetch tournament by id", async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { data: mockTournamentDetail },
      });

      const result = await tournamentsApi.get("tournament-123");

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        "/tournament/tournament-123"
      );
      expect(result).toEqual(mockTournamentDetail);
    });
  });

  describe("create", () => {
    it("should create tournament with correct data", async () => {
      const createRequest = {
        name: "Spring Championship",
        description: "Regional championship",
        eventDates: ["2025-03-20"],
        tieBreaks: ["BUCHHOLZ_CUT_1"] as const,
      };

      mockedApiClient.post.mockResolvedValue({
        data: { data: { ...mockTournament, ...createRequest } },
      });

      const result = await tournamentsApi.create(createRequest);

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        "/tournament",
        createRequest
      );
      expect(result.name).toBe("Spring Championship");
    });
  });

  describe("update", () => {
    it("should update tournament with correct data", async () => {
      const updateRequest = {
        name: "Updated Tournament Name",
        description: "Updated description",
      };

      mockedApiClient.put.mockResolvedValue({
        data: { data: { ...mockTournament, ...updateRequest } },
      });

      const result = await tournamentsApi.update("tournament-123", updateRequest);

      expect(mockedApiClient.put).toHaveBeenCalledWith(
        "/tournament/tournament-123",
        updateRequest
      );
      expect(result.name).toBe("Updated Tournament Name");
    });
  });

  describe("delete", () => {
    it("should delete tournament", async () => {
      mockedApiClient.delete.mockResolvedValue({});

      await tournamentsApi.delete("tournament-123");

      expect(mockedApiClient.delete).toHaveBeenCalledWith(
        "/tournament/tournament-123"
      );
    });
  });
});
