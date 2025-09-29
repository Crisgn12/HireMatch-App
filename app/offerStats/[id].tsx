import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { EstadisticasOfertaResponse, obtenerEstadisticasOferta } from '../services/api';

const OfferStats = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [stats, setStats] = useState<EstadisticasOfertaResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [id]);

  const fetchStats = async () => {
    try {
      const data = await obtenerEstadisticasOferta(parseInt(id));
      setStats(data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: (error as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ fontFamily: 'Poppins-Regular' }} className="mt-2 text-gray-600">
          Cargando estadísticas...
        </Text>
      </SafeAreaView>
    );
  }

  if (!stats) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
          No se pudieron cargar las estadísticas
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-6 mt-12">
        {/* Header */}
        <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-2xl text-primary mb-2">
            {stats.titulo}
          </Text>
          <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600 mb-2">
            {stats.descripcion}
          </Text>
          <View className="flex-row items-center mt-2">
            <View className={`px-3 py-1 rounded-full ${
              stats.estadoOferta === 'ACTIVA' ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <Text style={{ fontFamily: 'Poppins-SemiBold' }} className={`text-xs ${
                stats.estadoOferta === 'ACTIVA' ? 'text-green-600' : 'text-gray-600'
              }`}>
                {stats.estadoOferta}
              </Text>
            </View>
            <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-500 text-xs ml-2">
              {stats.diasActiva} días activa
            </Text>
          </View>
        </View>

        {/* Estadísticas Principales */}
        <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-lg text-gray-800 mb-4">
            Estadísticas Generales
          </Text>
          <View className="flex-row flex-wrap -mx-2">
            <View className="w-1/2 px-2 mb-4">
              <View className="bg-blue-50 rounded-lg p-3 items-center">
                <Icon name="visibility" size={24} color="#3B82F6" />
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-blue-600 text-lg mt-1">
                  {stats.vistasOferta}
                </Text>
                <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-blue-600 text-xs text-center">
                  Vistas
                </Text>
              </View>
            </View>
            <View className="w-1/2 px-2 mb-4">
              <View className="bg-green-50 rounded-lg p-3 items-center">
                <Icon name="person" size={24} color="#10B981" />
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-green-600 text-lg mt-1">
                  {stats.totalPostulaciones}
                </Text>
                <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-green-600 text-xs text-center">
                  Postulaciones
                </Text>
              </View>
            </View>
            <View className="w-1/2 px-2 mb-4">
              <View className="bg-purple-50 rounded-lg p-3 items-center">
                <Icon name="favorite" size={24} color="#8B5CF6" />
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-purple-600 text-lg mt-1">
                  {stats.totalMatches}
                </Text>
                <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-purple-600 text-xs text-center">
                  Matches
                </Text>
              </View>
            </View>
            <View className="w-1/2 px-2 mb-4">
              <View className="bg-yellow-50 rounded-lg p-3 items-center">
                <Icon name="star" size={24} color="#F59E0B" />
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-yellow-600 text-lg mt-1">
                  {stats.totalSuperlikes}
                </Text>
                <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-yellow-600 text-xs text-center">
                  SuperLikes
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Métricas de Rendimiento */}
        <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-lg text-gray-800 mb-4">
            Métricas de Rendimiento
          </Text>
          <View className="bg-gray-50 rounded-lg p-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                Tasa de Aceptación
              </Text>
              <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-green-600">
                {Math.round(stats.tasaAceptacion * 100)}%
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-3">
              <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                Tasa de Contacto
              </Text>
              <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-blue-600">
                {Math.round(stats.tasaContacto * 100)}%
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-3">
              <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                Tasa de Rechazo Empresa
              </Text>
              <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-red-600">
                {Math.round(stats.tasaRechazoEmpresa * 100)}%
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                Tasa de Rechazo Postulantes
              </Text>
              <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-orange-600">
                {Math.round(stats.tasaRechazo * 100)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Información Adicional */}
        <View className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-lg text-gray-800 mb-4">
            Detalles de la Oferta
          </Text>
          <View className="bg-gray-50 rounded-lg p-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                Tipo de Trabajo
              </Text>
              <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-800">
                {stats.tipoTrabajo}
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                Tipo de Contrato
              </Text>
              <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-800">
                {stats.tipoContrato}
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                Nivel de Experiencia
              </Text>
              <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-800">
                {stats.nivelExperiencia}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                Vacantes Disponibles
              </Text>
              <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-800">
                {stats.vacantesDisponibles}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-primary rounded-full px-6 py-3 mb-8"
        >
          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-white text-center text-base">
            Volver
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OfferStats;