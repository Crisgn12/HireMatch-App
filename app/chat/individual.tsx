// app/chat/individual.tsx
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MensajeItem from '../components/chat/MensajeItem';
import MessageInput from '../components/chat/MessageInput';
import { enviarMensaje, getUserProfile, MensajeResponse, obtenerChats, obtenerMensajes } from '../services/api';

const ChatIndividual = () => {
  const { ofertaId, nombreContraparte, tituloOferta } = useLocalSearchParams<{
    ofertaId: string;
    nombreContraparte: string;
    tituloOferta: string;
  }>();

  const [mensajes, setMensajes] = useState<MensajeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [chatId, setChatId] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {

    initializeChat();

    // Configura el intervalo para actualizar cada 3 segundos
    const intervalId = setInterval(initializeChat, 3000);

    // Limpia el intervalo al desmontar el componente
    return () => clearInterval(intervalId);
  }, []);

  const initializeChat = async () => {
    try {
      // Obtener el perfil del usuario para obtener su ID
      const profile = await getUserProfile();
      if (profile.perfilId) {
        setUserId(profile.perfilId);
      }

      await cargarMensajes();
    } catch (error) {
      console.error('Error inicializando chat:', error);
      Alert.alert('Error', 'No se pudo cargar el chat');
    } finally {
      setLoading(false);
    }
  };

  const cargarMensajes = async () => {
    try {
      const chats = await obtenerChats();
      const chatActual = chats.find(chat => chat.ofertaId === parseInt(ofertaId || '0'));
      
      if (chatActual) {
        setChatId(chatActual.id);
        const response = await obtenerMensajes(chatActual.id);
        // Los mensajes vienen ordenados por fecha DESC, los invertimos para mostrar del más antiguo al más reciente
        setMensajes(response.mensajes.reverse());
      } else {
        setMensajes([]);
      }
    } catch (error) {
      console.error('Error cargando mensajes:', error);
      setMensajes([]);
    }
  };

  const enviarNuevoMensaje = async (contenido: string) => {
    if (!ofertaId) {
      Alert.alert('Error', 'ID de oferta no válido');
      return;
    }

    setEnviando(true);
    try {
      const response = await enviarMensaje({
        ofertaId: parseInt(ofertaId),
        contenido
      });

      setMensajes(prev => [...prev, response]);
      
      if (!chatId) {
        setChatId(response.chatId);
      }

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error) {
      console.error('Error enviando mensaje:', error);
      Alert.alert('Error', 'No se pudo enviar el mensaje');
    } finally {
      setEnviando(false);
    }
  };

  const renderMensaje = ({ item }: { item: MensajeResponse }) => (
    <MensajeItem mensaje={item} userId={userId || 0} />
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <Icon name="autorenew" size={40} color="#3B82F6" />
          <Text style={{ fontFamily: 'Poppins-Regular' }} className="mt-2 text-gray-600">
            Cargando chat...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3"
        >
          <Icon name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-lg text-primary">
            {nombreContraparte}
          </Text>
          <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-sm text-gray-500" numberOfLines={1}>
            {tituloOferta}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Lista de mensajes */}
        <View className="flex-1 px-4 bg-gray-50">
          {mensajes.length === 0 ? (
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Icon name="chat-bubble-outline" size={64} color="#D1D5DB" />
              <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-500 text-center mt-4 text-base">
                ¡Inicia la conversación!
              </Text>
              <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-center mt-2 text-sm">
                Envía tu primer mensaje para comenzar a chatear
              </Text>
            </ScrollView>
          ) : (
            <FlatList
              ref={flatListRef}
              data={mensajes}
              renderItem={renderMensaje}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingVertical: 16 }}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
          )}
        </View>

        {/* Input de mensaje */}
        <MessageInput 
          onSendMessage={enviarNuevoMensaje}
          disabled={enviando}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatIndividual;