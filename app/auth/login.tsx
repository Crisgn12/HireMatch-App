import React from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';

const Login = () => {

  return (
    <View className='mt-24 justify-center items-center flex-col'>
      <View className='justify-center items-center gap-3 mb-12'>
        <Image
          source={require('../../assets/images/HireMatch-Logo.png')}
          className='size-40'
        />

        <Text
          style={{ fontFamily: 'PoppinsRegular' }} 
          className='text-3xl text-primary font-bold'>
          Inicio de Sesión
        </Text>

        <Text className='text-gray-700'>Inicia sesión con tus credenciales</Text>

      </View>

      <View className='gap-5 px-14 w-full'>
        <TextInput 
          id='email'
          className='border border-gray-300 rounded-xl p-3 w-full mb-4'
          placeholder='Correo electrónico'>
        </TextInput>

        <TextInput 
          id='passsword'
          secureTextEntry={true}
          className='border border-gray-300 rounded-xl p-3 w-full mb-10'
          placeholder='Contraseña'>
        </TextInput>

        <Pressable>
          <Text className='text-center text-white bg-primary p-3 rounded-xl font-semibold'>
            Iniciar Sesión
          </Text>
        </Pressable>

        <View className='flex-row justify-between items-center mt-2'>
          <View className='border border-gray-300 w-[40%]'></View>
          <Text>Ó</Text>
          <View className='border border-gray-300 w-[40%]'></View>
        </View>

        <Pressable className='border border-primary rounded-xl'>
          <Text className='text-center text-primary p-3 rounded-xl font-semibold'>
            Regístrate
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default Login;