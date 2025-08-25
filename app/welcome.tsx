import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

const Welcome = () => {
    const router = useRouter();


  return (
    <View className='flex-1 items-center justify-center'>
      <Image 
        source={require('../assets/images/HireMatch-Logo.png')} 
        className='size-60'
      />
      <View className='items-center px-10 '>
        <Text className='justify-center text-lg text-center'>Accede a cientos de oportunidades laborales en un solo lugar</Text>
      </View>

      <View className='w-full px-10 mt-10 gap-4'>
        <Pressable className="border border-primary bg-primary rounded-xl w-full mb-3" onPress={() => router.push('/auth/login')}>
          <Text className="text-center text-white p-3 rounded-xl font-semibold">
            Iniciar Sesión
          </Text>
        </Pressable>

        <Pressable className="border border-primary rounded-xl w-full" onPress={() => router.push('/auth/register')}>
          <Text className="text-center text-primary p-3 rounded-xl font-semibold">
            Regístrate
          </Text>
        </Pressable>

      </View>
    </View>
  )
}

export default Welcome