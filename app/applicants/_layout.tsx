import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
          headerTitle: 'Postulantes',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-row items-center bg-gray-100 rounded-full p-2 ml-2"
              style={{
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Icon name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
          ),
          headerBackground: () => (
            <View className="flex-1 bg-white border-b border-gray-100" />
          ),
        }}
      />
    </Stack>
  );
};

export default ApplicantsLayout;
