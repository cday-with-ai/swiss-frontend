import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roundsApi } from "@/lib/api";
import { Pairing, GameResult, RoundStatus } from "@/types/api";

const statusColors: Record<RoundStatus, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  PAIRED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
};

const resultLabels: Record<GameResult, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  WHITE_WINS: "1-0",
  BLACK_WINS: "0-1",
  DRAW: "½-½",
  WHITE_WINS_FORFEIT: "1-0 (F)",
  BLACK_WINS_FORFEIT: "0-1 (F)",
  DOUBLE_FORFEIT: "0-0 (F)",
};

const resultColors: Record<GameResult, string> = {
  NOT_STARTED: "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  WHITE_WINS: "bg-green-100 text-green-700",
  BLACK_WINS: "bg-green-100 text-green-700",
  DRAW: "bg-blue-100 text-blue-700",
  WHITE_WINS_FORFEIT: "bg-red-100 text-red-700",
  BLACK_WINS_FORFEIT: "bg-red-100 text-red-700",
  DOUBLE_FORFEIT: "bg-red-100 text-red-700",
};

function PairingCard({
  pairing,
  onPress,
}: {
  pairing: Pairing;
  onPress: () => void;
}) {
  const resultColor = resultColors[pairing.result];
  const hasResult =
    pairing.result !== "NOT_STARTED" && pairing.result !== "IN_PROGRESS";

  return (
    <TouchableOpacity
      className="bg-white rounded-lg p-4 mb-3 border border-gray-200 shadow-sm"
      onPress={onPress}
    >
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-xs text-gray-400">Board {pairing.boardNumber}</Text>
        <View className={`px-2 py-1 rounded ${resultColor}`}>
          <Text className="text-xs font-medium">
            {resultLabels[pairing.result]}
          </Text>
        </View>
      </View>

      {/* White Player */}
      <View className="flex-row items-center mb-2">
        <View className="w-6 h-6 bg-white border-2 border-gray-300 rounded mr-2" />
        <View className="flex-1">
          <View className="flex-row items-center">
            {pairing.whitePlayerTitle && (
              <Text className="text-xs font-bold text-orange-600 mr-1">
                {pairing.whitePlayerTitle}
              </Text>
            )}
            <Text className="font-medium text-gray-900" numberOfLines={1}>
              {pairing.whitePlayerName}
            </Text>
          </View>
          <Text className="text-xs text-gray-500">
            {pairing.whitePlayerRating}
            {pairing.whiteScore !== undefined && ` • ${pairing.whiteScore} pts`}
          </Text>
        </View>
        {hasResult && (
          <Text className="text-lg font-bold text-gray-900 ml-2">
            {pairing.result === "WHITE_WINS" ||
            pairing.result === "WHITE_WINS_FORFEIT"
              ? "1"
              : pairing.result === "DRAW"
              ? "½"
              : "0"}
          </Text>
        )}
      </View>

      {/* Black Player */}
      <View className="flex-row items-center">
        <View className="w-6 h-6 bg-gray-800 border-2 border-gray-800 rounded mr-2" />
        <View className="flex-1">
          <View className="flex-row items-center">
            {pairing.blackPlayerTitle && (
              <Text className="text-xs font-bold text-orange-600 mr-1">
                {pairing.blackPlayerTitle}
              </Text>
            )}
            <Text className="font-medium text-gray-900" numberOfLines={1}>
              {pairing.blackPlayerName}
            </Text>
          </View>
          <Text className="text-xs text-gray-500">
            {pairing.blackPlayerRating}
            {pairing.blackScore !== undefined && ` • ${pairing.blackScore} pts`}
          </Text>
        </View>
        {hasResult && (
          <Text className="text-lg font-bold text-gray-900 ml-2">
            {pairing.result === "BLACK_WINS" ||
            pairing.result === "BLACK_WINS_FORFEIT"
              ? "1"
              : pairing.result === "DRAW"
              ? "½"
              : "0"}
          </Text>
        )}
      </View>

      {pairing.isFloatPairing && (
        <Text className="text-xs text-gray-400 mt-2">Float pairing</Text>
      )}
    </TouchableOpacity>
  );
}

function ResultModal({
  visible,
  pairing,
  onClose,
  onSelect,
  isLoading,
}: {
  visible: boolean;
  pairing: Pairing | null;
  onClose: () => void;
  onSelect: (result: GameResult) => void;
  isLoading: boolean;
}) {
  if (!pairing) return null;

  const results: { result: GameResult; label: string; description: string }[] = [
    { result: "WHITE_WINS", label: "1-0", description: "White wins" },
    { result: "DRAW", label: "½-½", description: "Draw" },
    { result: "BLACK_WINS", label: "0-1", description: "Black wins" },
    {
      result: "WHITE_WINS_FORFEIT",
      label: "1-0 (F)",
      description: "White wins by forfeit",
    },
    {
      result: "BLACK_WINS_FORFEIT",
      label: "0-1 (F)",
      description: "Black wins by forfeit",
    },
    {
      result: "DOUBLE_FORFEIT",
      label: "0-0 (F)",
      description: "Double forfeit",
    },
    { result: "NOT_STARTED", label: "Clear", description: "Reset result" },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end">
        <TouchableOpacity
          className="flex-1"
          onPress={onClose}
          activeOpacity={1}
        />
        <View className="bg-white rounded-t-2xl p-6 shadow-xl">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-900">Enter Result</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-gray-500 text-lg">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Game Info */}
          <View className="bg-gray-50 rounded-lg p-3 mb-4">
            <Text className="text-sm text-gray-600">
              Board {pairing.boardNumber}
            </Text>
            <Text className="font-medium text-gray-900">
              {pairing.whitePlayerName} vs {pairing.blackPlayerName}
            </Text>
          </View>

          {/* Result Buttons */}
          <View className="flex-row flex-wrap">
            {results.slice(0, 3).map((r) => (
              <TouchableOpacity
                key={r.result}
                className={`flex-1 m-1 py-4 rounded-lg items-center ${
                  pairing.result === r.result
                    ? "bg-primary-600"
                    : "bg-gray-100"
                }`}
                onPress={() => onSelect(r.result)}
                disabled={isLoading}
              >
                <Text
                  className={`text-xl font-bold ${
                    pairing.result === r.result ? "text-white" : "text-gray-900"
                  }`}
                >
                  {r.label}
                </Text>
                <Text
                  className={`text-xs mt-1 ${
                    pairing.result === r.result
                      ? "text-primary-100"
                      : "text-gray-500"
                  }`}
                >
                  {r.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Forfeit Options */}
          <Text className="text-xs text-gray-400 uppercase mt-4 mb-2">
            Forfeit Options
          </Text>
          <View className="flex-row flex-wrap">
            {results.slice(3).map((r) => (
              <TouchableOpacity
                key={r.result}
                className={`px-4 py-2 m-1 rounded-lg ${
                  pairing.result === r.result ? "bg-red-600" : "bg-gray-100"
                }`}
                onPress={() => onSelect(r.result)}
                disabled={isLoading}
              >
                <Text
                  className={`text-sm font-medium ${
                    pairing.result === r.result ? "text-white" : "text-gray-700"
                  }`}
                >
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {isLoading && (
            <View className="absolute inset-0 bg-white/50 items-center justify-center">
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

export default function RoundDetailScreen() {
  const { id, roundId } = useLocalSearchParams<{ id: string; roundId: string }>();
  const [selectedPairing, setSelectedPairing] = useState<Pairing | null>(null);
  const queryClient = useQueryClient();

  const { data: round, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["round", roundId],
    queryFn: () => roundsApi.get(id, roundId),
    enabled: !!id && !!roundId,
  });

  const updatePairingMutation = useMutation({
    mutationFn: ({ pairingId, result }: { pairingId: string; result: GameResult }) =>
      roundsApi.updatePairing(id, roundId, pairingId, { result }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["round", roundId] });
      queryClient.invalidateQueries({ queryKey: ["rounds", id] });
      queryClient.invalidateQueries({ queryKey: ["players", id] });
      setSelectedPairing(null);
    },
  });

  const handleResultSelect = (result: GameResult) => {
    if (!selectedPairing) return;
    updatePairingMutation.mutate({
      pairingId: selectedPairing.id,
      result,
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!round) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">Round not found</Text>
      </View>
    );
  }

  const completedCount =
    round.pairings?.filter(
      (p) => p.result !== "NOT_STARTED" && p.result !== "IN_PROGRESS"
    ).length || 0;
  const totalCount = round.pairings?.length || 0;

  return (
    <>
      <Stack.Screen options={{ title: `Round ${round.roundNumber}` }} />
      <View className="flex-1 bg-gray-50">
        {/* Progress Header */}
        <View className="bg-white p-4 border-b border-gray-200">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-sm text-gray-500">Games Completed</Text>
              <Text className="text-2xl font-bold text-gray-900">
                {completedCount} / {totalCount}
              </Text>
            </View>
            <View
              className={`px-3 py-1 rounded-full ${
                statusColors[round.status]
              }`}
            >
              <Text className="text-sm font-medium">
                {round.status.replace("_", " ")}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="h-2 bg-gray-200 rounded-full mt-3">
            <View
              className="h-2 bg-primary-600 rounded-full"
              style={{
                width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
              }}
            />
          </View>
        </View>

        {/* Bye Info */}
        {round.byePlayerName && (
          <View className="bg-yellow-50 p-3 border-b border-yellow-200">
            <Text className="text-yellow-800">
              <Text className="font-medium">Bye:</Text> {round.byePlayerName} (
              {round.byeValue} pts)
            </Text>
          </View>
        )}

        <FlatList
          data={round.pairings || []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PairingCard
              pairing={item}
              onPress={() => setSelectedPairing(item)}
            />
          )}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <Text className="text-gray-500 text-center">
                No pairings in this round
              </Text>
            </View>
          }
        />

        <ResultModal
          visible={!!selectedPairing}
          pairing={selectedPairing}
          onClose={() => setSelectedPairing(null)}
          onSelect={handleResultSelect}
          isLoading={updatePairingMutation.isPending}
        />
      </View>
    </>
  );
}
