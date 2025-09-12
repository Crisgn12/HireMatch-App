import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Keyboard, Pressable, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { getUserProfile, loginUser } from '../services/api';

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          const profile = await getUserProfile();
          const { tipoPerfil } = profile;
          
          if (tipoPerfil === 'postulante') {
            router.replace('/(tabs)/home');
          } else if (tipoPerfil === 'empresa') {
            router.replace('/company/jobOffers');
          } else {
            await AsyncStorage.removeItem('token');
            console.log('Tipo de perfil no válido:', tipoPerfil);
          }
        } catch (err) {
          await AsyncStorage.removeItem('token');
          console.log('Token cleared due to invalid session or missing profile:', err);
        }
      }
    };
    checkAuth();
  }, [router]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await loginUser({ email, password });
      if (response.token) {
        await AsyncStorage.setItem('token', response.token);
        console.log('Token almacenado:', response.token);
        try {
          const profile = await getUserProfile();
          const { tipoPerfil } = profile;

          if (tipoPerfil === 'postulante') {
            router.replace('/(tabs)/home');
          } else if (tipoPerfil === 'empresa') {
            router.replace('/company/jobOffers');
          } else {
            await AsyncStorage.removeItem('token');
            setError('Tipo de perfil no válido.');
          }
        } catch (err) {
          // Redirect to ProfileCompletion if no profile
          router.replace({ pathname: '../auth/ProfileCompletion', params: { email } });
        }
      } else {
        setError('No se recibió un token válido.');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = (error as Error).message || 'Error al iniciar sesión. Intenta de nuevo.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEditing = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
            returnKeyType="done"
            onSubmitEditing={handleSubmitEditing}
            editable={!loading}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            className="border border-gray-300 rounded-xl p-3 w-full mb-10"
            placeholder="Contraseña"
            returnKeyType="done"
            onSubmitEditing={handleSubmitEditing}
            editable={!loading}
          />
          {error ? (
            <Text className="text-red-500 text-center">{error}</Text>
          ) : null}
          <Pressable onPress={handleLogin} disabled={loading}>
            <Text
              className={`text-center text-white bg-primary p-3 rounded-xl font-semibold ${
                loading ? 'opacity-50' : ''
              }`}
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </Text>
          </Pressable>
          <View className="flex-row justify-between items-center mt-2">
            <View className="border border-gray-300 w-[40%]" />
            <Text>Ó</Text>
            <View className="border border-gray-300 w-[40%]" />
          </View>
          <Pressable className="border border-primary rounded-xl" onPress={() => router.push('/auth/register')}>
            <Text className="text-center text-primary p-3 rounded-xl font-semibold">
              Regístrate
            </Text>
          </Pressable>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Login;