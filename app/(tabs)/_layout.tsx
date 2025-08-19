import { Stack } from 'expo-router';
import ProtectedLayout from '../_protected';

export default function TabsLayout() {
  return (
    <ProtectedLayout>
      <Stack>
        <Stack.Screen name="home" options={{ headerShown: false }} />
        {/* Añade otras pantallas de tabs aquí si las tienes */}
      </Stack>
    </ProtectedLayout>
  );
}