import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/auth";

export default function SettingsScreen() {
  const { user, clearTokens } = useAuthStore();

  const handleLogout = async () => {
    await clearTokens();
    router.replace("/(auth)/login");
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* User Info */}
      <View className="bg-white p-4 border-b border-gray-200">
        <Text className="text-sm text-gray-500">Signed in as</Text>
        <Text className="text-lg font-semibold text-gray-900">
          {user?.displayName || user?.username || "Unknown"}
        </Text>
        <Text className="text-sm text-gray-500">{user?.username}</Text>
      </View>

      {/* App Info */}
      <View className="bg-white p-4 mt-4 border-y border-gray-200">
        <Text className="text-sm text-gray-500 mb-2">About</Text>
        <View className="flex-row justify-between py-2">
          <Text className="text-gray-700">Version</Text>
          <Text className="text-gray-500">1.0.0</Text>
        </View>
        <View className="flex-row justify-between py-2">
          <Text className="text-gray-700">App Name</Text>
          <Text className="text-gray-500">Swiss Pairing</Text>
        </View>
      </View>

      {/* Actions */}
      <View className="p-4">
        <TouchableOpacity
          className="bg-red-50 border border-red-200 rounded-lg py-4"
          onPress={handleLogout}
        >
          <Text className="text-red-600 text-center font-semibold">
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
