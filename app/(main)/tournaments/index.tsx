import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { Link, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { tournamentsApi } from "@/lib/api";
import { Tournament } from "@/types/api";
import { useAuthStore } from "@/stores/auth";

function TournamentCard({ tournament }: { tournament: Tournament }) {
  return (
    <Link href={`/(main)/tournaments/${tournament.id}`} asChild>
      <TouchableOpacity className="bg-white rounded-lg p-4 mb-3 border border-gray-200 shadow-sm">
        <Text className="text-lg font-semibold text-gray-900">
          {tournament.name}
        </Text>
        {tournament.description ? (
          <Text className="text-gray-500 text-sm mt-1" numberOfLines={2}>
            {tournament.description}
          </Text>
        ) : null}
        {tournament.eventDates?.length > 0 && (
          <View className="flex-row mt-2">
            {tournament.eventDates.map((date, idx) => (
              <Text key={idx} className="text-xs text-gray-400 mr-2">
                {new Date(date).toLocaleDateString()}
              </Text>
            ))}
          </View>
        )}
        {tournament.directors?.length > 0 && (
          <Text className="text-xs text-gray-400 mt-1">
            TD: {tournament.directors.map((d) => d.name).join(", ")}
          </Text>
        )}
      </TouchableOpacity>
    </Link>
  );
}

export default function TournamentsScreen() {
  const clearTokens = useAuthStore((state) => state.clearTokens);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["tournaments"],
    queryFn: () => tournamentsApi.list({ size: 50, sort: "createdAt,desc" }),
  });

  const handleLogout = async () => {
    await clearTokens();
    router.replace("/(auth)/login");
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="text-red-500 text-center mb-4">
          {(error as any)?.message || "Failed to load tournaments"}
        </Text>
        <TouchableOpacity
          className="bg-primary-600 px-6 py-3 rounded-lg"
          onPress={() => refetch()}
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={data?.content || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TournamentCard tournament={item} />}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-gray-500 text-center">
              No tournaments yet.{"\n"}Create your first tournament!
            </Text>
          </View>
        }
        ListFooterComponent={
          <View className="pt-4 pb-8">
            <TouchableOpacity
              className="py-3"
              onPress={handleLogout}
            >
              <Text className="text-red-500 text-center">Sign Out</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Floating Action Button */}
      <Link href="/(main)/tournaments/new" asChild>
        <TouchableOpacity className="absolute bottom-6 right-6 w-14 h-14 bg-primary-600 rounded-full items-center justify-center shadow-lg">
          <Text className="text-white text-3xl font-light">+</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
