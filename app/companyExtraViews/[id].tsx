import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { deleteJobOffer, getJobOfferDetails, getUserProfile } from '../services/api';

// Interfaz para los datos de una oferta laboral detallada
interface JobOfferDetails {
  id: number;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  empresaNombre: string;
  empresaId: number;
  tipoTrabajo: string;
  tipoContrato: string;
  tipoContratoDescripcion: string;
  nivelExperiencia: string;
  salarioFormateado: string;
  tiempoPublicacion: string;
  areaTrabajo: string;
  salarioMinimo: number;
  salarioMaximo: number;
  moneda: string;
  aplicacionesRecibidas: number;
  aplicacionRapida?: boolean;
  permiteAplicacionExterna?: boolean;
}

// Interfaz para el perfil del usuario (para type safety)
interface UserProfile {
  perfilId: number;
  tipoPerfil: string;
  empresaId?: number; // Optional to handle missing empresaId
  nombreEmpresa?: string;
  descripcion?: string;
  ubicacion?: string;
  habilidades?: string;
  telefono?: string;
  sitioWeb?: string;
  experiencia?: string;
  educacion?: string;
  certificaciones?: string;
  intereses?: string;
  fotoUrl?: string;
}

const JobDetails = () => {
  const { id } = useLocalSearchParams() as { id: string };
  const router = useRouter();
  const [job, setJob] = useState<JobOfferDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        if (!id || typeof id !== 'string') {
          throw new Error('ID de oferta no válido');
        }
        const jobId = parseInt(id, 10);

        // Obtener detalles de la oferta
        const response = await getJobOfferDetails(jobId);
        console.log('Raw job offer details response:', JSON.stringify(response, null, 2));
        const offerData: JobOfferDetails = {
          id: response.id,
          titulo: response.titulo,
          descripcion: response.descripcion,
          ubicacion: response.ubicacion,
          empresaNombre: response.empresaNombre,
          empresaId: response.empresaId,
          tipoTrabajo: response.tipoTrabajo,
          tipoContrato: response.tipoContrato,
          tipoContratoDescripcion: response.tipoContratoDescripcion || response.tipoContrato,
          nivelExperiencia: response.nivelExperiencia,
          salarioFormateado: response.salarioFormateado,
          tiempoPublicacion: response.tiempoPublicacion,
          areaTrabajo: response.areaTrabajo,
          salarioMinimo: parseFloat(response.salarioMinimo) || 0,
          salarioMaximo: parseFloat(response.salarioMaximo) || 0,
          moneda: response.moneda || 'USD',
          aplicacionesRecibidas: response.aplicacionesRecibidas,
          aplicacionRapida: response.aplicacionRapida,
          permiteAplicacionExterna: response.permiteAplicacionExterna,
        };
        console.log('Parsed job offer data:', JSON.stringify(offerData, null, 2));
        setJob(offerData);

        // Verificar si el usuario actual es el dueño de la empresa
        try {
          const userProfile: UserProfile = await getUserProfile();
          console.log('Raw user profile response:', JSON.stringify(userProfile, null, 2));
          console.log('Comparing userProfile.tipoPerfil:', userProfile.tipoPerfil, 'with "EMPRESA"');
          console.log('Comparing userProfile.empresaId:', userProfile.empresaId, 'with response.empresaId:', response.empresaId);

          if (userProfile.tipoPerfil?.toLowerCase() === 'empresa' && userProfile.empresaId != null && userProfile.empresaId === response.empresaId) {
            console.log('User is the owner of the job offer');
            setIsOwner(true);
          } else {
            console.log('User is not the owner. tipoPerfil:', userProfile.tipoPerfil, ', empresaId match:', userProfile.empresaId === response.empresaId);
            if (userProfile.tipoPerfil?.toLowerCase() === 'empresa' && userProfile.empresaId == null) {
              console.warn('userProfile.empresaId is undefined or null, likely missing in ProfileResponse');
            }
            setIsOwner(false);
          }
        } catch (profileError: any) {
          console.error('Error fetching user profile:', profileError.message || profileError);
          console.error('Full profile error details:', JSON.stringify(profileError, null, 2));
          setIsOwner(false);
        }

      } catch (err) {
        console.error('Error fetching job details:', (err as Error).message || err);
        setError((err as Error).message || 'Error al cargar los detalles de la oferta');
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetails();
  }, [id]);

  const handleEdit = () => {
    if (job) {
      router.push({
        pathname: '/company/jobOffers',
        params: { editOfferId: job.id.toString() }
      });
    } else {
      Alert.alert('Error', 'No se pueden cargar los datos de la oferta para edición');
    }
  };

  const handleDelete = () => {
    if (!job) {
      Alert.alert('Error', 'No se pueden cargar los datos de la oferta para eliminación');
      return;
    }
    Alert.alert(
      'Confirmar Eliminación',
      `¿Estás seguro de que deseas eliminar la oferta "${job.titulo}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteJobOffer(job.id);
              Alert.alert(
                'Éxito',
                'Oferta eliminada correctamente',
                [{ text: 'OK', onPress: () => router.replace('/company/jobOffers') }],
                { cancelable: false }
              );
            } catch (err) {
              const errorMessage = (err as Error).message || 'Error al eliminar la oferta';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-700 mt-2 font-poppins">Cargando detalles...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-red-500 font-poppins">{error}</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-primary rounded-full px-4 py-2"
        >
          <Text className="text-white font-poppins-semibold">Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-500 font-poppins">No se encontraron detalles de la oferta.</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-primary rounded-full px-4 py-2"
        >
          <Text className="text-white font-poppins-semibold">Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-6">
        <Text className="text-2xl font-poppins-semibold text-gray-800 mb-4">{job.titulo}</Text>
        <Text className="text-sm text-gray-600 mb-2">{job.empresaNombre}</Text>
        <View className="flex-row flex-wrap mb-4">
          <Text className="text-sm text-gray-500 mr-2">{job.ubicacion}</Text>
          <Text className="text-sm text-gray-500 mr-2">• {job.tipoTrabajo}</Text>
          <Text className="text-sm text-gray-500 mr-2">• {job.tipoContratoDescripcion}</Text>
          <Text className="text-sm text-gray-500">• {job.nivelExperiencia}</Text>
        </View>

        <Text className="text-lg font-poppins-semibold text-gray-700 mb-2">Descripción</Text>
        <Text className="text-gray-600 mb-4">{job.descripcion}</Text>

        <Text className="text-lg font-poppins-semibold text-gray-700 mb-2">Área de Trabajo</Text>
        <Text className="text-gray-600 mb-4">{job.areaTrabajo}</Text>

        <Text className="text-lg font-poppins-semibold text-gray-700 mb-2">Salario</Text>
        <Text className="text-gray-600 mb-4">{job.salarioFormateado}</Text>

        <Text className="text-lg font-poppins-semibold text-gray-700 mb-2">Aplicaciones Recibidas</Text>
        <Text className="text-gray-600 mb-4">{job.aplicacionesRecibidas}</Text>

        <Text className="text-sm text-gray-400 mb-4">{job.tiempoPublicacion}</Text>

        {isOwner && (
          <View className="flex-col">
            <TouchableOpacity
              onPress={() => router.push(`../applicants/${job.id}`)}
              className="bg-green-500 rounded-full px-6 py-2 mt-4 flex-row items-center justify-center"
            >
              <Icon name="people" size={20} color="white" />
              <Text className="text-white font-poppins-semibold text-base text-center ml-2">
                Ver Postulantes ({job.aplicacionesRecibidas})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleEdit}
              className="bg-blue-500 rounded-full px-6 py-2 mt-4 flex-row items-center justify-center"
            >
              <Icon name="edit" size={20} color="white" />
              <Text className="text-white font-poppins-semibold text-base text-center ml-2">Editar Oferta</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              className="bg-red-500 rounded-full px-6 py-2 mt-2 flex-row items-center justify-center"
            >
              <Icon name="delete" size={20} color="white" />
              <Text className="text-white font-poppins-semibold text-base text-center ml-2">Eliminar Oferta</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isOwner && (
          <TouchableOpacity
            onPress={() => Alert.alert('Aplicar', 'Función de aplicación simulada')}
            className="bg-primary rounded-full px-6 py-2 mt-4"
          >
            <Text className="text-white font-poppins-semibold text-base text-center">Aplicar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-gray-200 rounded-full px-6 py-2 mt-2"
        >
          <Text className="text-gray-700 font-poppins-semibold text-base text-center">Volver</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default JobDetails;