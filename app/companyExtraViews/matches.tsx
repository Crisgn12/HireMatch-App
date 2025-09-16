import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, Image, Text, View } from 'react-native';

interface Match {
  postulacionId: number;
  ofertaId: number;
  tituloOferta: string;
  descripcionOferta: string;
  ubicacionOferta: string;
  fechaPostulacion: string;
  estado: string;
  superLike: boolean;
  usuarioId: number;
  nombreUsuario: string;
  apellidoUsuario: string;
  emailUsuario: string;
  fotoUrl: string;
}

const Matches = () => {
  const { matches } = useLocalSearchParams<{ matches: string }>();
  const matchData: Match[] = matches ? JSON.parse(matches) : [];

  const renderMatchItem = ({ item }: { item: Match }) => (
    <View className="flex-row bg-white p-3 rounded-lg mb-3 shadow-md">
      <Image
        source={{ uri: item.fotoUrl || 'https://via.placeholder.com/50' }}
        className="w-12 h-12 rounded-full mr-3"
        resizeMode="cover"
      />
      <View className="flex-1">
        <Text className="text-lg font-bold text-gray-900">{`${item.nombreUsuario} ${item.apellidoUsuario}`}</Text>
        <Text className="text-sm text-gray-500">{item.emailUsuario}</Text>
        <Text className="text-sm text-gray-700">
          {item.tituloOferta} - {item.ubicacionOferta}
        </Text>
        <Text className="text-xs text-gray-400">
          Postulado: {new Date(item.fechaPostulacion).toLocaleDateString()}
        </Text>
        {item.superLike && <Text className="text-xs text-yellow-500 font-bold">Super Like!</Text>}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50 p-4">
      {matchData.length > 0 ? (
        <FlatList
          data={matchData}
          renderItem={renderMatchItem}
          keyExtractor={(item) => item.postulacionId.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          className="flex-1"
        />
      ) : (
        <Text className="text-gray-500 text-center text-base mt-5">No hay matches disponibles</Text>
      )}
    </View>
  );
};

export default Matches;