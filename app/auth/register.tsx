import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Pressable, Text, TextInput, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { registerUser } from '../services/api';

const Register = () => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!nombre || !apellido || !email || !password) {
      setError('Por favor, completa todos los campos');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Formato de email inválido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await registerUser({ nombre, apellido, email, password });
      Alert.alert('Éxito', data.mensaje || 'Usuario registrado correctamente');
      router.navigate({ pathname: '/auth/verify', params: { email } });
    } catch (err) {
      setError((err as Error).message || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  // Dismiss keyboard when pressing "Done"
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
            Registro
          </Text>
          <Text className="text-gray-700">Crea tu cuenta en HireMatch</Text>
        </View>

        <View className="gap-5 px-14 w-full">
          <TextInput
            id="nombre"
            className="border border-gray-300 rounded-xl p-3 w-full mb-4"
            placeholder="Nombre"
            value={nombre}
            onChangeText={setNombre}
            editable={!loading}
            returnKeyType="done"
            onSubmitEditing={handleSubmitEditing}
          />
          <TextInput
            id="apellido"
            className="border border-gray-300 rounded-xl p-3 w-full mb-4"
            placeholder="Apellido"
            value={apellido}
            onChangeText={setApellido}
            editable={!loading}
            returnKeyType="done"
            onSubmitEditing={handleSubmitEditing}
          />
          <TextInput
            id="email"
            className="border border-gray-300 rounded-xl p-3 w-full mb-4"
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
            returnKeyType="done"
            onSubmitEditing={handleSubmitEditing}
          />
          <TextInput
            id="password"
            secureTextEntry={true}
            className="border border-gray-300 rounded-xl p-3 w-full mb-4"
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            editable={!loading}
            returnKeyType="done"
            onSubmitEditing={handleSubmitEditing}
          />

          {error ? (
            <Text className="text-red-500 text-center">{error}</Text>
          ) : null}

          <Pressable onPress={handleRegister} disabled={loading}>
            <Text
              className={`text-center text-white bg-primary p-3 rounded-xl font-semibold ${
                loading ? 'opacity-50' : ''
              }`}
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </Text>
          </Pressable>

          <View className="flex-row justify-between items-center mt-2">
            <View className="border border-gray-300 w-[40%]" />
            <Text>Ó</Text>
            <View className="border border-gray-300 w-[40%]" />
          </View>

          <Pressable onPress={() => router.navigate('/auth/login')} disabled={loading}>
            <Text
              className={`text-center text-primary p-3 rounded-xl font-semibold border border-primary ${
                loading ? 'opacity-50' : ''
              }`}
            >
              Iniciar Sesión
            </Text>
          </Pressable>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Register;