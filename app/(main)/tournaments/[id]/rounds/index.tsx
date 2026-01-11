import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useLocalSearchParams, Link, Stack, router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roundsApi, sectionsApi } from "@/lib/api";
import { Round, RoundStatus } from "@/types/api";

const statusColors: Record<RoundStatus, { bg: string; text: string }> = {
  PENDING: { bg: "bg-gray-100", text: "text-gray-600" },
  PAIRED: { bg: "bg-blue-100", text: "text-blue-700" },
  IN_PROGRESS: { bg: "bg-yellow-100", text: "text-yellow-700" },
  COMPLETED: { bg: "bg-green-100", text: "text-green-700" },
};

function RoundCard({
  round,
  tournamentId,
}: {
  round: Round;
  tournamentId: string;
}) {
  const colors = statusColors[round.status];

  return (
    <Link
      href={`/(main)/tournaments/${tournamentId}/rounds/${round.id}`}
      asChild
    >
      <TouchableOpacity className="bg-white rounded-lg p-4 mb-3 border border-gray-200 shadow-sm">
        <View className="flex-row justify-between items-start">
          <View>
            <Text className="text-lg font-semibold text-gray-900">
              Round {round.roundNumber}
            </Text>
            {round.pairingCount !== undefined && (
              <Text className="text-sm text-gray-500">
                {round.completedCount || 0} / {round.pairingCount} games
                completed
              </Text>
            )}
          </View>
          <View className={`px-3 py-1 rounded-full ${colors.bg}`}>
            <Text className={`text-xs font-medium ${colors.text}`}>
              {round.status.replace("_", " ")}
            </Text>
          </View>
        </View>

        {round.byePlayerName && (
          <Text className="text-xs text-gray-400 mt-2">
            Bye: {round.byePlayerName} ({round.byeValue} pts)
          </Text>
        )}

        {round.pairingTime && (
          <Text className="text-xs text-gray-400 mt-1">
            Paired: {new Date(round.pairingTime).toLocaleString()}
          </Text>
        )}
      </TouchableOpacity>
    </Link>
  );
}

export default function RoundsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: sections } = useQuery({
    queryKey: ["sections", id],
    queryFn: () => sectionsApi.list(id),
    enabled: !!id,
  });

  const defaultSection = sections?.[0];

  const { data: rounds, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["rounds", id],
    queryFn: () => roundsApi.list(id, defaultSection?.id),
    enabled: !!id,
  });

  const generateRoundMutation = useMutation({
    mutationFn: () =>
      roundsApi.generate(id, {
        sectionId: defaultSection?.id,
      }),
    onSuccess: (newRound) => {
      queryClient.invalidateQueries({ queryKey: ["rounds", id] });
      queryClient.invalidateQueries({ queryKey: ["sections", id] });
      router.push(`/(main)/tournaments/${id}/rounds/${newRound.id}`);
    },
    onError: (err: any) => {
      const message =
        err.response?.data?.error?.message || "Failed to generate pairings";
      Alert.alert("Pairing Error", message);
    },
  });

  const canGenerateNextRound = () => {
    if (!defaultSection) return false;
    if (!rounds || rounds.length === 0) return true;

    const lastRound = rounds[rounds.length - 1];
    const allCompleted =
      lastRound.status === "COMPLETED" ||
      (lastRound.pairingCount === lastRound.completedCount &&
        lastRound.pairingCount !== undefined);

    return (
      allCompleted && (defaultSection.currentRound || 0) < defaultSection.rounds
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: defaultSection
            ? `Rounds - ${defaultSection.shortTitle}`
            : "Rounds",
        }}
      />
      <View className="flex-1 bg-gray-50">
        {/* Section Info */}
        {defaultSection && (
          <View className="bg-white p-4 border-b border-gray-200">
            <View className="flex-row justify-between">
              <View>
                <Text className="text-sm text-gray-500">Current Round</Text>
                <Text className="text-2xl font-bold text-gray-900">
                  {defaultSection.currentRound} / {defaultSection.rounds}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-sm text-gray-500">Time Control</Text>
                <Text className="text-lg font-medium text-gray-700">
                  {defaultSection.timeControl}
                </Text>
              </View>
            </View>
          </View>
        )}

        <FlatList
          data={rounds || []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RoundCard round={item} tournamentId={id} />
          )}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <Text className="text-gray-500 text-center">
                No rounds generated yet.{"\n"}Generate pairings to start the
                tournament!
              </Text>
            </View>
          }
        />

        {/* Generate Round Button */}
        {canGenerateNextRound() && (
          <View className="p-4 bg-white border-t border-gray-200">
            <TouchableOpacity
              className={`rounded-lg py-4 ${
                generateRoundMutation.isPending
                  ? "bg-primary-400"
                  : "bg-primary-600"
              }`}
              onPress={() => generateRoundMutation.mutate()}
              disabled={generateRoundMutation.isPending}
            >
              {generateRoundMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center font-semibold">
                  Generate Round {(defaultSection?.currentRound || 0) + 1}{" "}
                  Pairings
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
}
