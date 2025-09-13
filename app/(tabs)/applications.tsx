// app/(tabs)/applications.tsx
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { EstadoPostulacion, getUserApplications, isValidEstadoPostulacion } from '../services/api';

// Interfaz basada en el DTO que proporcionaste
interface MatchUsuarioResponse {
  postulacionId: number;
  ofertaId: number;
  tituloOferta: string;
  descripcionOferta: string;
  ubicacionOferta: string;
  empresaNombre: string;
  empresaDescripcion: string;
  fechaPostulacion: string;
  estado: string;
  superLike: boolean;
}

// Estados de postulación disponibles
const ESTADOS_POSTULACION = [
  { label: 'Todos', value: '' },
  { label: 'Pendiente', value: 'PENDING' },
  { label: 'Super Like', value: 'SUPERLIKE' },
  { label: 'Aceptada', value: 'ACCEPTED' },
  { label: 'Rechazada', value: 'REJECTED' },
  { label: 'Match', value: 'MATCHED' },
];

// Componente para mostrar una postulación individual
const ApplicationCard = ({ application }: { application: MatchUsuarioResponse }) => {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'aceptada':
        return 'bg-green-100 text-green-800';
      case 'rechazada':
        return 'bg-red-100 text-red-800';
      case 'revisada':
        return 'bg-blue-100 text-blue-800';
      case 'pendiente':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <TouchableOpacity
      onPress={() => router.push(`/applicantViews/${application.ofertaId}`)}
      className="bg-white rounded-lg p-4 mb-4 shadow-md border border-gray-200"
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1">
          <Text className="text-lg font-poppins-semibold text-gray-800">
            {application.tituloOferta}
          </Text>
          <Text className="text-sm text-gray-600 mt-1">
            {application.empresaNombre}
          </Text>
        </View>
        <View className="flex-row items-center">
          {application.superLike && (
            <Icon name="star" size={20} color="#FFD700" style={{ marginRight: 4 }} />
          )}
          <View className={`px-2 py-1 rounded-full ${getEstadoColor(application.estado)}`}>
            <Text className="text-xs font-poppins-medium">
              {application.estado}
            </Text>
          </View>
        </View>
      </View>
      
      <Text className="text-sm text-gray-500 mb-2">
        {application.ubicacionOferta}
      </Text>
      
      <Text className="text-sm text-gray-700 mb-2" numberOfLines={2}>
        {application.descripcionOferta}
      </Text>
      
      <Text className="text-xs text-gray-400">
        Postulado el {formatDate(application.fechaPostulacion)}
      </Text>
    </TouchableOpacity>
  );
};

const Applications = () => {
  const [applications, setApplications] = useState<MatchUsuarioResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEstado, setSelectedEstado] = useState('');

  // Función para obtener las postulaciones
  const fetchApplications = async (estado?: string) => {
    try {
      setError(null);
      
      // Validar y convertir el estado si es necesario
      let estadoParam: EstadoPostulacion | undefined = undefined;
      if (estado && estado !== '' && isValidEstadoPostulacion(estado)) {
        estadoParam = estado as EstadoPostulacion;
      }
      
      const data = await getUserApplications(estadoParam);
      setApplications(data);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError((err as Error).message || 'Error al cargar las postulaciones');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Cargar postulaciones al montar el componente
  useEffect(() => {
    fetchApplications(selectedEstado);
  }, [selectedEstado]);

  // Función para refrescar
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchApplications(selectedEstado);
  }, [selectedEstado]);

  // Función para manejar el cambio de filtro de estado
  const handleEstadoChange = (estado: string) => {
    setSelectedEstado(estado);
    setLoading(true);
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#005187" />
        <Text className="text-gray-700 font-poppins mt-2">
          Cargando postulaciones...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">

      {/* Lista de postulaciones */}
      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="py-4">
          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <Text className="text-red-700 font-poppins text-center">
                {error}
              </Text>
              <TouchableOpacity
                onPress={() => fetchApplications(selectedEstado)}
                className="mt-2 bg-red-600 rounded-full px-4 py-2"
              >
                <Text className="text-white font-poppins-semibold text-center">
                  Reintentar
                </Text>
              </TouchableOpacity>
            </View>
          ) : applications.length > 0 ? (
            applications.map((application) => (
              <ApplicationCard
                key={application.postulacionId}
                application={application}
              />
            ))
          ) : (
            <View className="flex-1 justify-center items-center py-20">
              <Icon name="inbox" size={64} color="#9CA3AF" />
              <Text className="text-gray-500 font-poppins text-center mt-4">
                {selectedEstado
                  ? `No tienes postulaciones con estado "${ESTADOS_POSTULACION.find(e => e.value === selectedEstado)?.label}"`
                  : 'No tienes postulaciones aún'
                }
              </Text>
              <Text className="text-gray-400 font-poppins text-center mt-2">
                Comienza a explorar ofertas de empleo y postúlate a las que te interesen
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default Applications;