import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Keyboard, Pressable, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { verifyCode } from '../services/api';

const Verify = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;

  const handleVerify = async () => {
    if (!code) {
      setError('Por favor, ingresa el código de verificación');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await verifyCode({ email, code });
      Alert.alert('Éxito', data.mensaje || 'Cuenta verificada correctamente');
      router.navigate('/auth/login');
    } catch (err) {
      setError((err as Error).message || 'Error al verificar');
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
          <Text
            style={{ fontFamily: 'Poppins-Regular' }}
            className="text-3xl text-primary font-bold"
          >
            Verificación de Correo
          </Text>
          <Text className="text-gray-700 text-center">Ingresa el código enviado a {email}</Text>
        </View>

        <View className="gap-5 px-14 w-full">
          <TextInput
            id="code"
            className="border border-gray-300 rounded-xl p-3 w-full mb-4"
            placeholder="Código de verificación"
            value={code}
            onChangeText={setCode}
            keyboardType="numeric"
            editable={!loading}
            returnKeyType="done"
            onSubmitEditing={handleSubmitEditing}
          />

          {error ? (
            <Text className="text-red-500 text-center">{error}</Text>
          ) : null}

          <Pressable onPress={handleVerify} disabled={loading}>
            <Text
              className={`text-center text-white bg-primary p-3 rounded-xl font-semibold ${
                loading ? 'opacity-50' : ''
              }`}
            >
              {loading ? 'Verificando...' : 'Verificar'}
            </Text>
          </Pressable>

          <Pressable onPress={() => router.navigate('/auth/register')} disabled={loading}>
            <Text
              className={`text-center text-primary p-3 rounded-xl font-semibold border border-primary ${
                loading ? 'opacity-50' : ''
              }`}
            >
              Reenviar Código
            </Text>
          </Pressable>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Verify;