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
import { useLocalSearchParams, router, Stack } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sectionsApi } from "@/lib/api";
import { CreateSectionRequest } from "@/types/api";

export default function NewSectionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [name, setName] = useState("Open Section");
  const [shortName, setShortName] = useState("Open");
  const [rounds, setRounds] = useState("5");
  const [timeControl, setTimeControl] = useState("G/90+30");

  const createMutation = useMutation({
    mutationFn: (data: CreateSectionRequest) => sectionsApi.create(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections", id] });
      queryClient.invalidateQueries({ queryKey: ["tournament", id] });
      router.back();
    },
  });

  const handleSubmit = () => {
    if (!name.trim() || !rounds.trim() || !timeControl.trim()) {
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      shortName: shortName.trim() || undefined,
      rounds: parseInt(rounds, 10),
      timeControl: timeControl.trim(),
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: "Create Section" }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 bg-gray-50">
          <View className="p-4">
            <View className="bg-white rounded-lg p-4 mb-4">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Section Details
              </Text>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Section Name *
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white"
                  placeholder="e.g., Open Section, Under 1800"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Short Name
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white"
                  placeholder="e.g., Open, U1800"
                  value={shortName}
                  onChangeText={setShortName}
                />
                <Text className="text-xs text-gray-500 mt-1">
                  Used in pairing sheets and displays
                </Text>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Number of Rounds *
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white"
                  placeholder="e.g., 5"
                  value={rounds}
                  onChangeText={setRounds}
                  keyboardType="numeric"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Time Control *
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white"
                  placeholder="e.g., G/90+30, G/60;d5"
                  value={timeControl}
                  onChangeText={setTimeControl}
                />
                <Text className="text-xs text-gray-500 mt-1">
                  Standard notation: G/90+30 = 90 min + 30 sec increment
                </Text>
              </View>
            </View>

            {createMutation.isError && (
              <View className="bg-red-50 p-4 rounded-lg mb-4 border border-red-200">
                <Text className="text-red-700">
                  {(createMutation.error as any)?.response?.data?.error?.message ||
                    "Failed to create section"}
                </Text>
              </View>
            )}

            <TouchableOpacity
              className={`rounded-lg py-4 ${
                createMutation.isPending ? "bg-primary-400" : "bg-primary-600"
              }`}
              onPress={handleSubmit}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center font-semibold text-lg">
                  Create Section
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
