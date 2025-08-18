import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import '../global.css';

export default function AuthLayout() {

  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins-Medium.ttf'),
  });

  // No renderizar hasta que las fuentes estén cargadas
  if (!fontsLoaded) {
    return null; // O un componente de carga (e.g., <ActivityIndicator />)
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ title: "Iniciar Sesión" }} />
      {/* <Stack.Screen name="register" options={{ title: "Registrarse" }} /> */}
    </Stack>
  );
}