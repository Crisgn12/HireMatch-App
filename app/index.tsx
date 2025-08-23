import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();
  return (

    <View
      className="flex-1 items-center justify-center"
    >
      <Text className="text-2xl text-blue-400">Hola mundo</Text>
      
      <Text>welcome</Text>
      <Pressable onPress={() => router.push('../auth/login')}>
        <Text className='text-blue-500'>Go to Login</Text>
      </Pressable>
      <Pressable onPress={() => router.push('../auth/register')}>
        <Text className='text-blue-500'>Go to Register</Text>
      </Pressable>
      <Pressable onPress={() => router.push('../auth/ProfileCompletion')}>
        <Text className='text-blue-500'>Go to Profile Completion</Text>
      </Pressable>
    
    </View>
  );
}
