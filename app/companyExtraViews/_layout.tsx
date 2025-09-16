import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const JobOffersLayout = () => {
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
        name="index"
        options={{
          headerShown: false, // No mostramos header en la pantalla principal de jobOffers
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerTitle: 'Detalles de la Oferta',
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
          headerRight: () => (
            <View className="flex-row space-x-2 mr-2">
              {/* Share Button */}
              <TouchableOpacity 
                className="bg-blue-100 rounded-full p-2"
                style={{
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Icon name="share" size={20} color="#3B82F6" />
              </TouchableOpacity>
              
              {/* Bookmark Button */}
              <TouchableOpacity 
                className="bg-yellow-100 rounded-full p-2"
                style={{
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Icon name="bookmark-border" size={20} color="#F59E0B" />
              </TouchableOpacity>
            </View>
          ),
          headerBackground: () => (
            <View className="flex-1 bg-white border-b border-gray-100" />
          ),
        }}
      />
      <Stack.Screen
        name="matches"
        options={{
          headerShown: true, 
          headerTitle: 'Matches',
          headerTitleAlign: 'center',
        }}
      />
    </Stack>
  );
};

export default JobOffersLayout;