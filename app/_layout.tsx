import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import './global.css';

export default function RootLayout() {

  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
  });

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token && window.location.pathname !== '/(tabs)/home') {
        // Redirigir a home si hay token y no está ya en home
        window.location.href = '/(tabs)/home'; // Nota: Esto es una aproximación; ver abajo
      }
    };
    checkAuth();
  }, []);

  if (!fontsLoaded) {
    console.log('Fuentes no cargadas. Verifica las rutas.');
    return null;
  }

  return (
    <Stack
      initialRouteName="welcome"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)/home" options={{ headerShown: true }} />
      
    </Stack>
  );
}
