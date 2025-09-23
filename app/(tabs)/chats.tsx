import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { obtenerChats } from '../services/api';

interface ChatResponse {
  id: number;
  ofertaId: number;
  tituloOferta: string;
  nombreContraparte: string;
  ultimoMensaje: string;
  ultimaActividad: string;
  noLeidos: number;
}

const Chats = () => {
  const [chats, setChats] = useState<ChatResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);
      try {
        const data = await obtenerChats();
        setChats(data);
      } catch (err) {
        setError('Error al cargar los chats');
      } finally {
        setLoading(false);
      }
    };

    // Carga inicial
    fetchChats();

    // Configura el intervalo para actualizar cada 3 segundos
    const intervalId = setInterval(fetchChats, 3000);

    // Limpia el intervalo al desmontar el componente
    return () => clearInterval(intervalId);
  }, []);

  const handleChatPress = (chat: ChatResponse) => {
    router.push({
      pathname: '/chat/individual',
      params: {
        chatId: chat.id.toString(),
        ofertaId: chat.ofertaId.toString(),
        nombreContraparte: chat.nombreContraparte,
        tituloOferta: chat.tituloOferta,
      },
    });
  };

  const renderChatItem = ({ item }: { item: ChatResponse }) => (
    <TouchableOpacity
      onPress={() => handleChatPress(item)}
      className="flex-row bg-white p-4 rounded-lg mb-2 shadow-md items-center"
    >
      <Icon name="person" size={40} color="#3B82F6" className="mr-3" />
      <View className="flex-1">
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-bold text-gray-900">{item.nombreContraparte}</Text>
          <Text className="text-xs text-gray-500">
            {new Date(item.ultimaActividad).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <Text numberOfLines={1} className="text-sm text-gray-600 mt-1">
          {item.ultimoMensaje || 'Sin mensajes aún'}
        </Text>
        {item.noLeidos > 0 && (
          <View className="absolute right-4 top-4 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
            <Text className="text-white text-xs font-bold">{item.noLeidos > 99 ? '99+' : item.noLeidos}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading && chats.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-700 mt-2">Cargando chats...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-red-500">{error}</Text>
        <TouchableOpacity
          onPress={() => setError(null)} // Simula recargar
          className="mt-4 bg-blue-500 rounded-full px-4 py-2"
        >
          <Text className="text-white font-bold">Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 p-4">
      {chats.length > 0 ? (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          className="flex-1"
        />
      ) : (
        <Text className="text-gray-500 text-center text-base mt-5">No hay chats disponibles</Text>
      )}
    </View>
  );
};

export default Chats;