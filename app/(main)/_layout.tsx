import { Stack } from "expo-router";

export default function MainLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#2563eb",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Stack.Screen
        name="tournaments/index"
        options={{ title: "Tournaments" }}
      />
      <Stack.Screen
        name="tournaments/new"
        options={{ title: "New Tournament" }}
      />
      <Stack.Screen
        name="tournaments/[id]/index"
        options={{ title: "Tournament" }}
      />
      <Stack.Screen
        name="tournaments/[id]/players"
        options={{ title: "Players" }}
      />
      <Stack.Screen
        name="tournaments/[id]/rounds/index"
        options={{ title: "Rounds" }}
      />
      <Stack.Screen
        name="tournaments/[id]/rounds/[roundId]"
        options={{ title: "Round" }}
      />
      <Stack.Screen
        name="tournaments/[id]/standings"
        options={{ title: "Standings" }}
      />
      <Stack.Screen
        name="settings"
        options={{ title: "Settings" }}
      />
    </Stack>
  );
}
