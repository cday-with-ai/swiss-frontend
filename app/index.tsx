import { Redirect } from "expo-router";
import { View, ActivityIndicator, Text } from "react-native";
import { useAuthStore } from "@/stores/auth";

export default function Index() {
  const { isLoading, isAuthenticated } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f3f4f6" }}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 16, color: "#6b7280" }}>Loading...</Text>
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(main)/tournaments" />;
  }

  return <Redirect href="/(auth)/login" />;
}
