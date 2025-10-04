import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { toggleGuardarOferta, verificarOfertaGuardada } from '../services/api';

const JobOffersLayout = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const currentOfferId = params.id as string;

  // Verificar si la oferta está guardada al cargar
  useEffect(() => {
    if (currentOfferId) {
      checkBookmarkStatus();
    }
  }, [currentOfferId]);

  const checkBookmarkStatus = async () => {
    try {
      const isSaved = await verificarOfertaGuardada(parseInt(currentOfferId));
      setIsBookmarked(isSaved);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const handleBookmark = async () => {
    if (!currentOfferId || bookmarkLoading) return;
    
    setBookmarkLoading(true);
    
    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      await toggleGuardarOferta(parseInt(currentOfferId));
      
      // Toggle estado local
      const newState = !isBookmarked;
      setIsBookmarked(newState);
      
      // Mostrar toast
      Toast.show({
        type: 'success',
        text1: newState ? 'Oferta guardada' : 'Oferta eliminada',
        text2: newState 
          ? 'La oferta se ha guardado en tu lista' 
          : 'La oferta se ha eliminado de tu lista',
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: (error as Error).message,
      });
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleShare = () => {
    // Implementar funcionalidad de compartir si lo deseas
    Alert.alert(
      'Compartir',
      'Funcionalidad de compartir próximamente',
      [{ text: 'OK' }]
    );
  };

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
          headerShown: false,
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
                onPress={handleShare}
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
              
              {/* Bookmark Button with Animation */}
              <TouchableOpacity 
                onPress={handleBookmark}
                disabled={bookmarkLoading}
                className={`rounded-full p-2 ${
                  isBookmarked ? 'bg-yellow-400' : 'bg-yellow-100'
                }`}
                style={{
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                  opacity: bookmarkLoading ? 0.6 : 1,
                }}
              >
                <Icon 
                  name={isBookmarked ? 'bookmark' : 'bookmark-border'} 
                  size={20} 
                  color={isBookmarked ? '#FFFFFF' : '#F59E0B'} 
                />
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