import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { roundsApi, sectionsApi } from "@/lib/api";
import { PlayerStanding, TieBreakType } from "@/types/api";

const tiebreakLabels: Record<TieBreakType, string> = {
  BUCHHOLZ: "Buch",
  BUCHHOLZ_CUT_1: "Buch-1",
  BUCHHOLZ_CUT_2: "Buch-2",
  BUCHHOLZ_MEDIAN_1: "MBuch",
  BUCHHOLZ_MEDIAN_2: "MBuch-2",
  SONNEBORN_BERGER: "SB",
  PROGRESSIVE: "Prog",
  DIRECT_ENCOUNTER: "DE",
  ARO: "ARO",
  NUMBER_OF_WINS: "Wins",
  NUMBER_OF_BLACKS: "Black",
  KOYA: "Koya",
};

const resultColors: Record<string, string> = {
  W: "text-green-600",
  L: "text-red-600",
  D: "text-blue-600",
  B: "text-gray-400",
  X: "text-gray-300",
};

function StandingRow({
  standing,
  tiebreakOrder,
}: {
  standing: PlayerStanding;
  tiebreakOrder: TieBreakType[];
}) {
  return (
    <View className="bg-white px-4 py-3 border-b border-gray-100">
      <View className="flex-row items-center">
        {/* Rank */}
        <Text className="w-8 text-lg font-bold text-gray-400">
          {standing.rank}
        </Text>

        {/* Player Info */}
        <View className="flex-1">
          <View className="flex-row items-center">
            {standing.title && (
              <Text className="text-xs font-bold text-orange-600 mr-1">
                {standing.title}
              </Text>
            )}
            <Text className="font-medium text-gray-900" numberOfLines={1}>
              {standing.playerName}
            </Text>
          </View>
          <Text className="text-xs text-gray-500">{standing.rating}</Text>
        </View>

        {/* Score */}
        <View className="items-end ml-2">
          <Text className="text-xl font-bold text-gray-900">
            {standing.score}
          </Text>
        </View>
      </View>

      {/* Results Row */}
      {standing.results?.length > 0 && (
        <View className="flex-row mt-2 ml-8">
          {standing.results.map((r, idx) => (
            <View
              key={idx}
              className="w-6 h-6 items-center justify-center mr-1 bg-gray-50 rounded"
            >
              <Text className={`text-xs font-bold ${resultColors[r.result] || "text-gray-400"}`}>
                {r.result}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Tiebreaks */}
      {tiebreakOrder.length > 0 && (
        <View className="flex-row mt-2 ml-8">
          {tiebreakOrder.slice(0, 3).map((tb) => (
            <View key={tb} className="mr-4">
              <Text className="text-xs text-gray-400">
                {tiebreakLabels[tb]}
              </Text>
              <Text className="text-sm text-gray-700">
                {standing.tiebreaks[tb]?.toFixed(1) ?? "-"}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function StandingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: sections } = useQuery({
    queryKey: ["sections", id],
    queryFn: () => sectionsApi.list(id),
    enabled: !!id,
  });

  const defaultSectionId = sections?.[0]?.id;

  const { data, isLoading, refetch, isRefetching, isError } = useQuery({
    queryKey: ["standings", id, defaultSectionId],
    queryFn: () => roundsApi.getStandings(id, defaultSectionId),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="text-gray-500 text-center">
          No standings available yet.{"\n"}Complete at least one round to see
          standings.
        </Text>
      </View>
    );
  }

  const tiebreakOrder = Object.keys(
    data.standings[0]?.tiebreaks || {}
  ) as TieBreakType[];

  return (
    <>
      <Stack.Screen
        options={{
          title: data.sectionName
            ? `Standings - ${data.sectionName}`
            : "Standings",
        }}
      />
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white p-4 border-b border-gray-200">
          <View className="flex-row justify-between">
            <View>
              <Text className="text-sm text-gray-500">After Round</Text>
              <Text className="text-2xl font-bold text-gray-900">
                {data.roundNumber} / {data.totalRounds}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-sm text-gray-500">Players</Text>
              <Text className="text-lg font-medium text-gray-700">
                {data.standings.length}
              </Text>
            </View>
          </View>

          {/* Legend */}
          <View className="flex-row mt-3 pt-3 border-t border-gray-100">
            <View className="flex-row items-center mr-4">
              <Text className="text-xs font-bold text-green-600 mr-1">W</Text>
              <Text className="text-xs text-gray-500">Win</Text>
            </View>
            <View className="flex-row items-center mr-4">
              <Text className="text-xs font-bold text-blue-600 mr-1">D</Text>
              <Text className="text-xs text-gray-500">Draw</Text>
            </View>
            <View className="flex-row items-center mr-4">
              <Text className="text-xs font-bold text-red-600 mr-1">L</Text>
              <Text className="text-xs text-gray-500">Loss</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-xs font-bold text-gray-400 mr-1">B</Text>
              <Text className="text-xs text-gray-500">Bye</Text>
            </View>
          </View>
        </View>

        <FlatList
          data={data.standings}
          keyExtractor={(item) => item.playerId}
          renderItem={({ item }) => (
            <StandingRow standing={item} tiebreakOrder={tiebreakOrder} />
          )}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <Text className="text-gray-500 text-center">
                No standings available
              </Text>
            </View>
          }
        />
      </View>
    </>
  );
}
