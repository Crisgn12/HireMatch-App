import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

const Home = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Remover el token de AsyncStorage
      await AsyncStorage.removeItem('token');
      // Redirigir a la pantalla de login
      router.replace('/auth/login');
    } catch (error) {
      console.log('Error al cerrar sesión:', error);
    }
  };

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-2xl text-black">Home</Text>
      <Pressable
        onPress={handleLogout}
        className="mt-4 bg-red-500 p-3 rounded-lg"
      >
        <Text className="text-white font-semibold">Cerrar Sesión</Text>
      </Pressable>
    </View>
  );
};

export default Home;