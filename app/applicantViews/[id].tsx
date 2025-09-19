import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getJobOfferDetails, getUserApplications } from '../services/api';

// Interfaz para los detalles de una oferta desde la perspectiva del postulante
interface JobOfferApplicationDetails {
  // Datos de la oferta
  id: number;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  empresaNombre: string;
  empresaDescripcion: string;
  tipoTrabajo: string;
  tipoContrato: string;
  nivelExperiencia: string;
  salarioFormateado: string;
  areaTrabajo: string;
  tiempoPublicacion: string;
  
  // Datos de la postulación
  postulacionId: number;
  fechaPostulacion: string;
  estado: string;
  superLike: boolean;
  
  // Campos opcionales adicionales que podrían venir del endpoint
  beneficios?: string;
  requisitos?: string;
  habilidadesRequeridas?: string;
  aplicacionRapida?: boolean;
  permiteAplicacionExterna?: boolean;
}

const ApplicationDetails = () => {
  const { id } = useLocalSearchParams() as { id: string };
  const router = useRouter();
  const [jobDetails, setJobDetails] = useState<JobOfferApplicationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        if (!id || typeof id !== 'string') {
          throw new Error('ID de oferta no válido');
        }
        
        const jobId = parseInt(id, 10);
        
        // Obtener detalles de la oferta usando el endpoint existente
        const jobData = await getJobOfferDetails(jobId);
        
        // También obtener todas las postulaciones del usuario para encontrar la específica de esta oferta
        const userApplications = await getUserApplications();
        const currentApplication = userApplications.find(app => app.ofertaId === jobId);
        
        if (!currentApplication) {
          throw new Error('No se encontró tu postulación para esta oferta');
        }
        
        const jobDetailsData: JobOfferApplicationDetails = {
          // Datos de la oferta
          id: jobData.id,
          titulo: jobData.titulo,
          descripcion: jobData.descripcion,
          ubicacion: jobData.ubicacion,
          empresaNombre: jobData.empresaNombre,
          empresaDescripcion: currentApplication.empresaDescripcion,
          tipoTrabajo: jobData.tipoTrabajo,
          tipoContrato: jobData.tipoContrato,
          nivelExperiencia: jobData.nivelExperiencia,
          salarioFormateado: jobData.salarioFormateado,
          areaTrabajo: jobData.areaTrabajo,
          tiempoPublicacion: jobData.tiempoPublicacion,
          
          // Datos de la postulación
          postulacionId: currentApplication.postulacionId,
          fechaPostulacion: currentApplication.fechaPostulacion,
          estado: currentApplication.estado,
          superLike: currentApplication.superLike,
          
          // Campos adicionales del endpoint de detalles si están disponibles
          beneficios: jobData.beneficios || '',
          requisitos: jobData.requisitos || '',
          habilidadesRequeridas: jobData.habilidadesRequeridas || '',
          aplicacionRapida: jobData.aplicacionRapida,
          permiteAplicacionExterna: jobData.permiteAplicacionExterna,
        };

        setJobDetails(jobDetailsData);
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError((err as Error).message || 'Error al cargar los detalles de la oferta');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getEstadoInfo = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'aceptada':
        return {
          color: 'text-green-700',
          bgColor: 'bg-green-100',
          icon: 'check-circle',
          message: 'Tu postulación ha sido aceptada'
        };
      case 'rechazada':
        return {
          color: 'text-red-700',
          bgColor: 'bg-red-100',
          icon: 'cancel',
          message: 'Tu postulación ha sido rechazada'
        };
      case 'revisada':
        return {
          color: 'text-blue-700',
          bgColor: 'bg-blue-100',
          icon: 'visibility',
          message: 'Tu postulación está siendo revisada'
        };
      case 'pendiente':
      default:
        return {
          color: 'text-yellow-700',
          bgColor: 'bg-yellow-100',
          icon: 'schedule',
          message: 'Tu postulación está pendiente de revisión'
        };
    }
  };

  const handleGoToChat = () => {
    if (!jobDetails) return;
    
    router.push({
      pathname: '../chat/individual',
      params: {
        ofertaId: jobDetails.id.toString(),
        nombreContraparte: jobDetails.empresaNombre,
        tituloOferta: jobDetails.titulo
      }
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#005187" />
        <Text className="text-gray-700 mt-2 font-poppins">Cargando detalles...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <Icon name="error-outline" size={64} color="#EF4444" />
        <Text className="text-red-500 font-poppins text-center mt-4 px-4">{error}</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-primary rounded-full px-6 py-2"
        >
          <Text className="text-white font-poppins-semibold">Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!jobDetails) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <Icon name="inbox" size={64} color="#9CA3AF" />
        <Text className="text-gray-500 font-poppins text-center mt-4">
          No se encontraron detalles de la oferta.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-primary rounded-full px-6 py-2"
        >
          <Text className="text-white font-poppins-semibold">Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const estadoInfo = getEstadoInfo(jobDetails.estado);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header de estado de postulación */}
        <View className={`${estadoInfo.bgColor} p-4 mx-4 mt-4 rounded-lg flex-row items-center`}>
          <Icon name={estadoInfo.icon} size={24} color={estadoInfo.color.replace('text-', '#')} />
          <View className="ml-3 flex-1">
            <Text className={`font-poppins-semibold ${estadoInfo.color}`}>
              Estado: {jobDetails.estado}
            </Text>
            <Text className={`font-poppins text-sm ${estadoInfo.color}`}>
              {estadoInfo.message}
            </Text>
          </View>
          {jobDetails.superLike && (
            <Icon name="star" size={24} color="#FFD700" />
          )}
        </View>

        {/* Información de la oferta */}
        <View className="bg-white mx-4 mt-4 rounded-lg p-6 shadow-sm">
          <Text className="text-2xl font-poppins-semibold text-gray-800 mb-2">
            {jobDetails.titulo}
          </Text>
          
          <View className="flex-row items-center mb-4">
            <Icon name="business" size={20} color="#6B7280" />
            <Text className="text-lg text-gray-600 ml-2 font-poppins-medium">
              {jobDetails.empresaNombre}
            </Text>
          </View>

          <View className="flex-row flex-wrap mb-4">
            <View className="flex-row items-center mr-4 mb-2">
              <Icon name="location-on" size={16} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-1">{jobDetails.ubicacion}</Text>
            </View>
            <View className="flex-row items-center mr-4 mb-2">
              <Icon name="work" size={16} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-1">{jobDetails.tipoTrabajo}</Text>
            </View>
            <View className="flex-row items-center mr-4 mb-2">
              <Icon name="schedule" size={16} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-1">{jobDetails.tipoContrato}</Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Icon name="trending-up" size={16} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-1">{jobDetails.nivelExperiencia}</Text>
            </View>
          </View>

          {jobDetails.salarioFormateado && (
            <View className="flex-row items-center mb-4">
              <Icon name="attach-money" size={20} color="#059669" />
              <Text className="text-lg text-green-600 ml-1 font-poppins-semibold">
                {jobDetails.salarioFormateado}
              </Text>
            </View>
          )}
        </View>

        {/* Descripción */}
        <View className="bg-white mx-4 mt-4 rounded-lg p-6 shadow-sm">
          <Text className="text-lg font-poppins-semibold text-gray-800 mb-3">
            Descripción del puesto
          </Text>
          <Text className="text-gray-700 font-poppins leading-6">
            {jobDetails.descripcion}
          </Text>
        </View>

        {/* Área de trabajo */}
        {jobDetails.areaTrabajo && (
          <View className="bg-white mx-4 mt-4 rounded-lg p-6 shadow-sm">
            <Text className="text-lg font-poppins-semibold text-gray-800 mb-3">
              Área de trabajo
            </Text>
            <Text className="text-gray-700 font-poppins">
              {jobDetails.areaTrabajo}
            </Text>
          </View>
        )}

        {/* Información adicional si está disponible */}
        {jobDetails.requisitos && (
          <View className="bg-white mx-4 mt-4 rounded-lg p-6 shadow-sm">
            <Text className="text-lg font-poppins-semibold text-gray-800 mb-3">
              Requisitos
            </Text>
            <Text className="text-gray-700 font-poppins">
              {jobDetails.requisitos}
            </Text>
          </View>
        )}

        {jobDetails.habilidadesRequeridas && (
          <View className="bg-white mx-4 mt-4 rounded-lg p-6 shadow-sm">
            <Text className="text-lg font-poppins-semibold text-gray-800 mb-3">
              Habilidades requeridas
            </Text>
            <Text className="text-gray-700 font-poppins">
              {jobDetails.habilidadesRequeridas}
            </Text>
          </View>
        )}

        {/* Información de la empresa */}
        {jobDetails.empresaDescripcion && (
          <View className="bg-white mx-4 mt-4 rounded-lg p-6 shadow-sm">
            <Text className="text-lg font-poppins-semibold text-gray-800 mb-3">
              Sobre la empresa
            </Text>
            <Text className="text-gray-700 font-poppins">
              {jobDetails.empresaDescripcion}
            </Text>
          </View>
        )}

        {/* Información de postulación */}
        <View className="bg-white mx-4 mt-4 rounded-lg p-6 shadow-sm">
          <Text className="text-lg font-poppins-semibold text-gray-800 mb-3">
            Información de tu postulación
          </Text>
          <View className="flex-row items-center mb-2">
            <Icon name="event" size={16} color="#6B7280" />
            <Text className="text-gray-600 ml-2 font-poppins">
              Postulado el: {formatDate(jobDetails.fechaPostulacion)}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Icon name="access-time" size={16} color="#6B7280" />
            <Text className="text-gray-600 ml-2 font-poppins">
              Publicado: {jobDetails.tiempoPublicacion}
            </Text>
          </View>
        </View>

        {/* Botones de acción */}
        <View className="p-4 pb-8">
          {/* Botón Ver Chat */}
          <TouchableOpacity
            onPress={handleGoToChat}
            className="bg-primary rounded-full px-6 py-3 flex-row items-center justify-center mb-3"
          >
            <Icon name="chat" size={20} color="white" />
            <Text className="text-white font-poppins-semibold text-base ml-2">
              Ver Chat con {jobDetails.empresaNombre}
            </Text>
          </TouchableOpacity>

          {/* Botón de volver */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-gray-500 rounded-full px-6 py-3 flex-row items-center justify-center"
          >
            <Icon name="arrow-back" size={20} color="white" />
            <Text className="text-white font-poppins-semibold text-base ml-2">
              Volver a mis postulaciones
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ApplicationDetails;