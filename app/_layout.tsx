import { Stack } from "expo-router";
import './global.css';

export default function RootLayout() {
  return (
    <Stack
      initialRouteName="welcome"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
