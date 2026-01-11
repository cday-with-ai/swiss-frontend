import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tournamentsApi } from "@/lib/api";
import { TieBreakType } from "@/types/api";

const DEFAULT_TIEBREAKS: TieBreakType[] = [
  "BUCHHOLZ_CUT_1",
  "BUCHHOLZ",
  "SONNEBORN_BERGER",
];

export default function NewTournamentScreen() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [directorName, setDirectorName] = useState("");
  const [error, setError] = useState("");

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: tournamentsApi.create,
    onSuccess: (tournament) => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      router.replace(`/(main)/tournaments/${tournament.id}`);
    },
    onError: (err: any) => {
      const errorData = err.response?.data?.error;
      if (errorData?.details) {
        const messages = Object.values(errorData.details).join(", ");
        setError(messages);
      } else {
        setError(errorData?.message || "Failed to create tournament");
      }
    },
  });

  const handleCreate = () => {
    setError("");
    if (!name.trim()) {
      setError("Tournament name is required");
      return;
    }
    if (!eventDate) {
      setError("At least one event date is required");
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      eventDates: [eventDate],
      tieBreaks: DEFAULT_TIEBREAKS,
      directors: directorName.trim()
        ? [{ name: directorName.trim() }]
        : undefined,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        className="flex-1 bg-gray-50"
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        {error ? (
          <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <Text className="text-red-700 text-center">{error}</Text>
          </View>
        ) : null}

        <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <Text className="text-sm font-medium text-gray-700 mb-1">
            Tournament Name *
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white"
            placeholder="e.g., Winter Open 2025"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <Text className="text-sm font-medium text-gray-700 mb-1">
            Description
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white"
            placeholder="Optional description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={{ minHeight: 80, textAlignVertical: "top" }}
          />
        </View>

        <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <Text className="text-sm font-medium text-gray-700 mb-1">
            Event Date *
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white"
            placeholder="YYYY-MM-DD"
            value={eventDate}
            onChangeText={setEventDate}
          />
          <Text className="text-xs text-gray-400 mt-1">
            Format: YYYY-MM-DD (e.g., 2025-01-15)
          </Text>
        </View>

        <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <Text className="text-sm font-medium text-gray-700 mb-1">
            Tournament Director Name
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white"
            placeholder="e.g., John Smith"
            value={directorName}
            onChangeText={setDirectorName}
          />
        </View>

        <TouchableOpacity
          className={`rounded-lg py-4 mt-4 ${
            createMutation.isPending ? "bg-primary-400" : "bg-primary-600"
          }`}
          onPress={handleCreate}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-center font-semibold text-base">
              Create Tournament
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
