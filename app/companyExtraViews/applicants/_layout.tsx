import { Stack, useRouter } from 'expo-router';
import React from 'react';

const ApplicantsLayout = () => {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: { 
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#1f2937',
        headerTitleStyle: { 
          fontFamily: 'Poppins-SemiBold',
          fontSize: 18,
          color: '#1f2937'
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="[ofertaId]"
        options={{
          headerShown: false, // ApplicantsView maneja su propio header
        }}
      />
    </Stack>
  );
};

export default ApplicantsLayout;
