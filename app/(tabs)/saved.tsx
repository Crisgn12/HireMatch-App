import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { obtenerOfertasGuardadas, toggleGuardarOferta } from '../services/api';

interface OfertaGuardada {
  id: number;
  titulo: string;
  empresaNombre: string;
  ubicacion: string;
  tipoTrabajo: string;
  tipoContrato: string;
  salarioFormateado: string;
  tiempoPublicacion: string;
  areaTrabajo: string;
}

const SavedOfferCard = ({ 
  offer, 
  onRemove 
}: { 
  offer: OfertaGuardada; 
  onRemove: () => void;
}) => {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);

  const handleRemove = async (e: any) => {
    e.stopPropagation();
    
    Alert.alert(
      'Eliminar oferta guardada',
      '¿Estás seguro de que quieres eliminar esta oferta de guardados?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setRemoving(true);
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            
            try {
              await toggleGuardarOferta(offer.id);
              Toast.show({
                type: 'success',
                text1: 'Oferta eliminada',
                text2: 'La oferta se ha eliminado de guardados',
                visibilityTime: 2000,
              });
              onRemove();
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No se pudo eliminar la oferta',
              });
              setRemoving(false);
            }
          }
        }
      ]
    );
  };

  const handlePress = () => {
    router.push(`../companyExtraViews/${offer.id}`);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={removing}
      className="bg-white rounded-xl p-4 mb-4 shadow-md border border-gray-200"
      style={{ opacity: removing ? 0.5 : 1 }}
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 mr-2">
          <Text 
            style={{ fontFamily: 'Poppins-SemiBold' }} 
            className="text-lg text-gray-800"
          >
            {offer.titulo}
          </Text>
          <Text 
            style={{ fontFamily: 'Poppins-Regular' }} 
            className="text-sm text-gray-600 mt-1"
          >
            {offer.empresaNombre}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleRemove}
          disabled={removing}
          className="bg-red-50 rounded-full p-2"
        >
          {removing ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <Icon name="bookmark" size={20} color="#EF4444" />
          )}
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center mb-2">
        <Icon name="location-on" size={16} color="#6B7280" />
        <Text 
          style={{ fontFamily: 'Poppins-Regular' }} 
          className="text-sm text-gray-500 ml-1"
        >
          {offer.ubicacion}
        </Text>
      </View>

      <View className="flex-row items-center mb-2">
        <Icon name="work" size={16} color="#6B7280" />
        <Text 
          style={{ fontFamily: 'Poppins-Regular' }} 
          className="text-sm text-gray-500 ml-1"
        >
          {offer.tipoTrabajo} • {offer.tipoContrato}
        </Text>
      </View>

      {offer.salarioFormateado && (
        <View className="flex-row items-center mb-2">
          <Icon name="attach-money" size={16} color="#10B981" />
          <Text 
            style={{ fontFamily: 'Poppins-SemiBold' }} 
            className="text-sm text-green-600 ml-1"
          >
            {offer.salarioFormateado}
          </Text>
        </View>
      )}

      <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-gray-100">
        <Text 
          style={{ fontFamily: 'Poppins-Regular' }} 
          className="text-xs text-gray-400"
        >
          {offer.tiempoPublicacion}
        </Text>
        <View className="bg-blue-50 px-2 py-1 rounded-full">
          <Text 
            style={{ fontFamily: 'Poppins-SemiBold' }} 
            className="text-xs text-blue-600"
          >
            {offer.areaTrabajo}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const SavedOffers = () => {
  const [offers, setOffers] = useState<OfertaGuardada[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedOffers = async () => {
    try {
      setError(null);
      const data = await obtenerOfertasGuardadas();
      setOffers(data.content || []);
    } catch (err) {
      console.error('Error fetching saved offers:', err);
      setError((err as Error).message || 'Error al cargar ofertas guardadas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSavedOffers();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSavedOffers();
  }, []);

  const handleRemoveOffer = (offerId: number) => {
    setOffers(prev => prev.filter(offer => offer.id !== offerId));
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#005187" />
        <Text 
          style={{ fontFamily: 'Poppins-Regular' }} 
          className="text-gray-700 mt-2"
        >
          Cargando ofertas guardadas...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}

      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="py-4">
          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <Text 
                style={{ fontFamily: 'Poppins-Regular' }} 
                className="text-red-700 text-center"
              >
                {error}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setLoading(true);
                  fetchSavedOffers();
                }}
                className="mt-2 bg-red-600 rounded-full px-4 py-2"
              >
                <Text 
                  style={{ fontFamily: 'Poppins-SemiBold' }} 
                  className="text-white text-center"
                >
                  Reintentar
                </Text>
              </TouchableOpacity>
            </View>
          ) : offers.length > 0 ? (
            offers.map((offer) => (
              <SavedOfferCard
                key={offer.id}
                offer={offer}
                onRemove={() => handleRemoveOffer(offer.id)}
              />
            ))
          ) : (
            <View className="flex-1 justify-center items-center py-20">
              <View className="bg-yellow-100 rounded-full p-6 mb-4">
                <Icon name="bookmark-border" size={64} color="#F59E0B" />
              </View>
              <Text 
                style={{ fontFamily: 'Poppins-SemiBold' }} 
                className="text-gray-800 text-center text-xl mb-2"
              >
                No tienes ofertas guardadas
              </Text>
              <Text 
                style={{ fontFamily: 'Poppins-Regular' }} 
                className="text-gray-500 text-center px-8"
              >
                Cuando encuentres ofertas interesantes, toca el botón de guardar para añadirlas aquí
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default SavedOffers;