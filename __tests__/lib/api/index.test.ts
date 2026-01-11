// Test that barrel exports work correctly
import {
  authApi,
  tournamentsApi,
  sectionsApi,
  playersApi,
  roundsApi,
  tiebreaksApi,
  apiClient,
} from "@/lib/api";

describe("API barrel exports", () => {
  it("should export authApi", () => {
    expect(authApi).toBeDefined();
    expect(authApi.login).toBeDefined();
    expect(authApi.register).toBeDefined();
  });

  it("should export tournamentsApi", () => {
    expect(tournamentsApi).toBeDefined();
    expect(tournamentsApi.list).toBeDefined();
    expect(tournamentsApi.get).toBeDefined();
  });

  it("should export sectionsApi", () => {
    expect(sectionsApi).toBeDefined();
    expect(sectionsApi.list).toBeDefined();
    expect(sectionsApi.create).toBeDefined();
  });

  it("should export playersApi", () => {
    expect(playersApi).toBeDefined();
    expect(playersApi.list).toBeDefined();
    expect(playersApi.create).toBeDefined();
  });

  it("should export roundsApi", () => {
    expect(roundsApi).toBeDefined();
    expect(roundsApi.list).toBeDefined();
    expect(roundsApi.generate).toBeDefined();
  });

  it("should export tiebreaksApi", () => {
    expect(tiebreaksApi).toBeDefined();
    expect(tiebreaksApi.get).toBeDefined();
    expect(tiebreaksApi.update).toBeDefined();
  });

  it("should export apiClient", () => {
    expect(apiClient).toBeDefined();
    expect(apiClient.get).toBeDefined();
    expect(apiClient.post).toBeDefined();
  });
});
