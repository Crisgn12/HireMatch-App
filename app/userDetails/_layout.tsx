import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const UserDetailsLayout = () => {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: { 
          backgroundColor: '#005187', // Mismo color que el tabBarActiveTintColor
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: { 
          fontFamily: 'Poppins-SemiBold',
          fontSize: 18,
          color: '#ffffff'
        },
        headerShadowVisible: true,
      }}
    >
      <Stack.Screen
        name="[email]"
        options={{
          headerTitle: 'Perfil del Candidato',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()} 
              className="flex-row items-center bg-white bg-opacity-20 rounded-full p-2 ml-2"
              style={{
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Icon name="arrow-back" size={24} color="#000000ff" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View className="flex-row space-x-2 mr-2">
              {/* Contact Button */}
              <TouchableOpacity 
                onPress={() => {
                  // Aquí podrías abrir email o whatsapp
                  console.log('Contactar candidato');
                }}
                className="bg-white bg-opacity-20 rounded-full p-2"
                style={{
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Icon name="email" size={20} color="#000000ff" />
              </TouchableOpacity>
              
              {/* Favorite Button */}
              <TouchableOpacity 
                onPress={() => {
                  console.log('Agregar a favoritos');
                }}
                className="bg-white bg-opacity-20 rounded-full p-2"
                style={{
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Icon name="star-border" size={20} color="#000000ff" />
              </TouchableOpacity>
            </View>
          ),
          headerBackground: () => (
            <View 
              style={{ 
                flex: 1, 
                backgroundColor: '#005187' // Fondo sólido en lugar del gradiente verde
              }} 
            />
          ),
        }}
      />
    </Stack>
  );
};

export default UserDetailsLayout;