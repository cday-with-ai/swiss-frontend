import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { useLocalSearchParams, Link, Stack } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { tournamentsApi, sectionsApi } from "@/lib/api";

function ActionCard({
  title,
  subtitle,
  href,
  color = "primary",
}: {
  title: string;
  subtitle: string;
  href: string;
  color?: "primary" | "green" | "purple" | "orange";
}) {
  const bgColors = {
    primary: "bg-primary-50 border-primary-200",
    green: "bg-green-50 border-green-200",
    purple: "bg-purple-50 border-purple-200",
    orange: "bg-orange-50 border-orange-200",
  };

  const textColors = {
    primary: "text-primary-700",
    green: "text-green-700",
    purple: "text-purple-700",
    orange: "text-orange-700",
  };

  return (
    <Link href={href as any} asChild>
      <TouchableOpacity
        className={`rounded-lg p-4 border ${bgColors[color]} flex-1 min-w-[45%] m-1`}
      >
        <Text className={`text-lg font-semibold ${textColors[color]}`}>
          {title}
        </Text>
        <Text className="text-gray-500 text-sm mt-1">{subtitle}</Text>
      </TouchableOpacity>
    </Link>
  );
}

export default function TournamentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data: tournament,
    isLoading: tournamentLoading,
    refetch: refetchTournament,
    isRefetching: tournamentRefetching,
  } = useQuery({
    queryKey: ["tournament", id],
    queryFn: () => tournamentsApi.get(id),
    enabled: !!id,
  });

  const {
    data: sections,
    isLoading: sectionsLoading,
    refetch: refetchSections,
  } = useQuery({
    queryKey: ["sections", id],
    queryFn: () => sectionsApi.list(id),
    enabled: !!id,
  });

  const isLoading = tournamentLoading || sectionsLoading;
  const isRefetching = tournamentRefetching;

  const handleRefresh = () => {
    refetchTournament();
    refetchSections();
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!tournament) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">Tournament not found</Text>
      </View>
    );
  }

  const currentSection = sections?.[0];

  return (
    <>
      <Stack.Screen options={{ title: tournament.name }} />
      <ScrollView
        className="flex-1 bg-gray-50"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />
        }
      >
        {/* Tournament Info */}
        <View className="bg-white p-4 border-b border-gray-200">
          {tournament.description && (
            <Text className="text-gray-600 mb-2">{tournament.description}</Text>
          )}
          <View className="flex-row flex-wrap">
            {tournament.eventDates?.length > 0 && (
              <View className="mr-6 mb-2">
                <Text className="text-xs text-gray-400 uppercase">Date(s)</Text>
                <Text className="text-gray-700">
                  {tournament.eventDates
                    .map((d) => new Date(d).toLocaleDateString())
                    .join(", ")}
                </Text>
              </View>
            )}
            <View className="mr-6 mb-2">
              <Text className="text-xs text-gray-400 uppercase">Sections</Text>
              <Text className="text-gray-700">{tournament.sectionCount}</Text>
            </View>
            <View className="mr-6 mb-2">
              <Text className="text-xs text-gray-400 uppercase">Players</Text>
              <Text className="text-gray-700">{tournament.playerCount}</Text>
            </View>
          </View>
        </View>

        {/* Section Info */}
        {sections && sections.length > 0 && (
          <View className="bg-white p-4 mt-2 border-b border-gray-200">
            <Text className="text-xs text-gray-400 uppercase mb-2">
              Current Section
            </Text>
            {sections.map((section) => (
              <View
                key={section.id}
                className="flex-row justify-between items-center py-2"
              >
                <View>
                  <Text className="font-medium text-gray-900">
                    {section.name}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {section.timeControl} • {section.rounds} rounds
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-sm text-gray-600">
                    Round {section.currentRound} / {section.rounds}
                  </Text>
                  <Text className="text-xs text-gray-400">
                    {section.playerCount} players
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* No Section Warning */}
        {(!sections || sections.length === 0) && (
          <View className="bg-yellow-50 p-4 m-4 rounded-lg border border-yellow-200">
            <Text className="text-yellow-800 font-medium">
              No sections created yet
            </Text>
            <Text className="text-yellow-700 text-sm mt-1">
              Create a section to start adding players and generating pairings.
            </Text>
            <Link href={`/(main)/tournaments/${id}/sections/new` as any} asChild>
              <TouchableOpacity className="bg-yellow-600 rounded-lg py-3 mt-3">
                <Text className="text-white text-center font-semibold">
                  Create Section
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        )}

        {/* Action Cards */}
        <View className="p-3">
          <Text className="text-xs text-gray-400 uppercase mb-2 ml-1">
            Actions
          </Text>
          <View className="flex-row flex-wrap">
            <ActionCard
              title="Players"
              subtitle={`${tournament.playerCount} registered`}
              href={`/(main)/tournaments/${id}/players`}
              color="primary"
            />
            <ActionCard
              title="Rounds"
              subtitle={
                currentSection
                  ? `Round ${currentSection.currentRound}/${currentSection.rounds}`
                  : "No section"
              }
              href={`/(main)/tournaments/${id}/rounds`}
              color="green"
            />
            <ActionCard
              title="Standings"
              subtitle="View current standings"
              href={`/(main)/tournaments/${id}/standings`}
              color="purple"
            />
            <ActionCard
              title="Settings"
              subtitle="Tournament settings"
              href={`/(main)/settings`}
              color="orange"
            />
          </View>
        </View>

        {/* Quick Actions */}
        {currentSection && currentSection.currentRound < currentSection.rounds && (
          <View className="p-4">
            <Link
              href={`/(main)/tournaments/${id}/rounds`}
              asChild
            >
              <TouchableOpacity className="bg-primary-600 rounded-lg py-4">
                <Text className="text-white text-center font-semibold">
                  {currentSection.currentRound === 0
                    ? "Generate Round 1 Pairings"
                    : `Continue to Round ${currentSection.currentRound + 1}`}
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        )}
      </ScrollView>
    </>
  );
}
