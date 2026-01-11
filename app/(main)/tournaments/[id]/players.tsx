import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { playersApi, sectionsApi } from "@/lib/api";
import { Player, CreatePlayerRequest } from "@/types/api";

function PlayerRow({ player, rank }: { player: Player; rank: number }) {
  return (
    <View className="bg-white px-4 py-3 border-b border-gray-100 flex-row items-center">
      <Text className="w-8 text-gray-400 text-sm">{rank}</Text>
      <View className="flex-1">
        <View className="flex-row items-center">
          {player.title && (
            <Text className="text-xs font-bold text-orange-600 mr-1">
              {player.title}
            </Text>
          )}
          <Text className="font-medium text-gray-900">{player.name}</Text>
        </View>
        <Text className="text-sm text-gray-500">
          {player.mainRating} • Score: {player.totalScore}
        </Text>
      </View>
      <View className="items-end">
        {!player.active && (
          <Text className="text-xs text-red-500 font-medium">Withdrawn</Text>
        )}
        {player.byes.length > 0 && (
          <Text className="text-xs text-gray-400">
            Bye: R{player.byes.map((b) => b.roundNumber).join(",")}
          </Text>
        )}
      </View>
    </View>
  );
}

function AddPlayerModal({
  visible,
  onClose,
  onSubmit,
  isLoading,
  sectionId,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePlayerRequest) => void;
  isLoading: boolean;
  sectionId?: string;
}) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState("");
  const [title, setTitle] = useState("");
  const [fideId, setFideId] = useState("");

  const handleSubmit = () => {
    if (!name.trim() || !rating.trim()) return;
    onSubmit({
      name: name.trim(),
      mainRating: parseInt(rating, 10),
      title: title.trim() || undefined,
      fideId: fideId.trim() || undefined,
      sectionId,
    });
  };

  const handleClose = () => {
    setName("");
    setRating("");
    setTitle("");
    setFideId("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 justify-end">
          <View className="bg-white rounded-t-2xl p-6 shadow-xl">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">Add Player</Text>
              <TouchableOpacity onPress={handleClose}>
                <Text className="text-gray-500 text-lg">✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Name *
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                  placeholder="Player name"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Rating *
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                  placeholder="e.g., 1500"
                  value={rating}
                  onChangeText={setRating}
                  keyboardType="numeric"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Title
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                  placeholder="e.g., GM, IM, FM, NM"
                  value={title}
                  onChangeText={setTitle}
                  autoCapitalize="characters"
                />
              </View>

              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  FIDE ID
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                  placeholder="Optional"
                  value={fideId}
                  onChangeText={setFideId}
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity
                className={`rounded-lg py-4 ${
                  isLoading ? "bg-primary-400" : "bg-primary-600"
                }`}
                onPress={handleSubmit}
                disabled={isLoading || !name.trim() || !rating.trim()}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-center font-semibold">
                    Add Player
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function PlayersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showAddModal, setShowAddModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: sections } = useQuery({
    queryKey: ["sections", id],
    queryFn: () => sectionsApi.list(id),
    enabled: !!id,
  });

  const defaultSectionId = sections?.[0]?.id;

  const {
    data,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["players", id],
    queryFn: () =>
      playersApi.list(id, {
        size: 200,
        sort: "pairingNumber,asc",
      }),
    enabled: !!id,
  });

  const addPlayerMutation = useMutation({
    mutationFn: (data: CreatePlayerRequest) => playersApi.create(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players", id] });
      queryClient.invalidateQueries({ queryKey: ["tournament", id] });
      setShowAddModal(false);
    },
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const players = data?.content || [];
  const hasSections = sections && sections.length > 0;

  return (
    <>
      <Stack.Screen options={{ title: `Players (${players.length})` }} />
      <View className="flex-1 bg-gray-50">
        {/* No Sections Warning */}
        {!hasSections && (
          <View className="bg-yellow-50 p-4 m-4 rounded-lg border border-yellow-200">
            <Text className="text-yellow-800 font-medium">
              No sections created yet
            </Text>
            <Text className="text-yellow-700 text-sm mt-1">
              You must create a section before adding players. Go back to the tournament page to create a section.
            </Text>
          </View>
        )}

        {/* Header Stats */}
        <View className="bg-white p-4 border-b border-gray-200 flex-row">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">
              {players.filter((p) => p.active).length}
            </Text>
            <Text className="text-xs text-gray-500">Active</Text>
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">
              {players.filter((p) => !p.active).length}
            </Text>
            <Text className="text-xs text-gray-500">Withdrawn</Text>
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">
              {players.length > 0
                ? Math.round(
                    players.reduce((sum, p) => sum + p.mainRating, 0) /
                      players.length
                  )
                : 0}
            </Text>
            <Text className="text-xs text-gray-500">Avg Rating</Text>
          </View>
        </View>

        <FlatList
          data={players}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <PlayerRow player={item} rank={index + 1} />
          )}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <Text className="text-gray-500 text-center">
                No players yet.{"\n"}Add players to get started!
              </Text>
            </View>
          }
        />

        {/* Add Player FAB - only show if sections exist */}
        {hasSections && (
          <TouchableOpacity
            className="absolute bottom-6 right-6 w-14 h-14 bg-primary-600 rounded-full items-center justify-center shadow-lg"
            onPress={() => setShowAddModal(true)}
          >
            <Text className="text-white text-3xl font-light">+</Text>
          </TouchableOpacity>
        )}

        <AddPlayerModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={addPlayerMutation.mutate}
          isLoading={addPlayerMutation.isPending}
          sectionId={defaultSectionId}
        />
      </View>
    </>
  );
}
