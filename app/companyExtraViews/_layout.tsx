import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const JobOffersLayout = () => {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#f5f5f5' },
        headerTintColor: '#3B82F6',
        headerTitleStyle: { fontFamily: 'Poppins-SemiBold' },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false, // No mostramos header en la pantalla principal de jobOffers
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerTitle: 'Detalles de la Oferta',
          headerTintColor: 'black',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Icon name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
};

export default JobOffersLayout;