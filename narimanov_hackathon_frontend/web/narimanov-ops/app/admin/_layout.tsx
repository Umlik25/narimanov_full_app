import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="map" />
      <Stack.Screen name="ai-review" />
      <Stack.Screen name="issues/[id]" />
    </Stack>
  );
}
