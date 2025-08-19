import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Alert, Image, Pressable, Text, TextInput, View } from 'react-native';
import { loginUser } from '../services/api';

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Verificar si hay un token al montar el componente
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        router.replace('/(tabs)/home'); // Redirigir a home si ya está autenticado
      }
    };
    checkAuth();
  }, [router]);

  const handleLogin = async () => {
    try {
      // Validar que los campos no estén vacíos
      if (!email || !password) {
        Alert.alert('Error', 'Por favor, completa todos los campos.');
        return;
      }

      // Enviar solicitud de login
      const response = await loginUser({ email, password });

      // Almacenar el token en AsyncStorage si el login es exitoso
      if (response.token) {
        await AsyncStorage.setItem('token', response.token);
        console.log('Token almacenado:', response.token);
        // Limpiar la pila y redirigir a la pantalla principal
        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Error', 'No se recibió un token válido.');
      }
    } catch (error) {
      // Manejar errores desde el interceptor o la API
      const errorMessage = error.message || 'Error al iniciar sesión. Intenta de nuevo.';
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <View className="mt-24 justify-center items-center flex-col">
      <View className="justify-center items-center gap-3 mb-12">
        <Image
          source={require('../../assets/images/HireMatch-Logo.png')}
          className="size-40"
        />
        <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-3xl text-primary font-bold">
          Inicio de Sesión
        </Text>
        <Text className="text-gray-700">Inicia sesión con tus credenciales</Text>
      </View>

      <View className="gap-5 px-14 w-full">
        <TextInput
          value={email}
          onChangeText={setEmail}
          className="border border-gray-300 rounded-xl p-3 w-full mb-4"
          placeholder="Correo electrónico"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
          className="border border-gray-300 rounded-xl p-3 w-full mb-10"
          placeholder="Contraseña"
        />
        <Pressable onPress={handleLogin}>
          <Text className="text-center text-white bg-primary p-3 rounded-xl font-semibold">
            Iniciar Sesión
          </Text>
        </Pressable>
        <View className="flex-row justify-between items-center mt-2">
          <View className="border border-gray-300 w-[40%]"></View>
          <Text>Ó</Text>
          <View className="border border-gray-300 w-[40%]"></View>
        </View>
        <Pressable className="border border-primary rounded-xl" onPress={() => router.push('../auth/register')}>
          <Text className="text-center text-primary p-3 rounded-xl font-semibold">
            Regístrate
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default Login;