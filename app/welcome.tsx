import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

const Welcome = () => {
    const router = useRouter();


  return (
    <View className='flex-1 items-center justify-center'>
      <Text>welcome</Text>
      <Pressable onPress={() => router.push('/auth/login')}>
        <Text className='text-blue-500'>Go to Login</Text>
      </Pressable>
    </View>
  )
}

export default Welcome