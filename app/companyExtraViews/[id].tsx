import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { getJobOfferDetails } from '../services/api';

// Interfaz para los datos de una oferta laboral detallada
interface JobOfferDetails {
  id: number;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  empresaNombre: string;
  tipoTrabajo: string;
  nivelExperiencia: string;
  salarioFormateado: string;
  tiempoPublicacion: string;
  areaTrabajo: string;
  beneficios?: string;
  requisitos?: string;
  aplicacionesRecibidas: number;
}

const JobDetails = () => {
  const { id } = useLocalSearchParams() as { id: string };
  const router = useRouter();
  const [job, setJob] = useState<JobOfferDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        if (!id || typeof id !== 'string') {
          throw new Error('ID de oferta no válido');
        }
        const jobId = parseInt(id, 10);
        const response = await getJobOfferDetails(jobId);
        const offerData: JobOfferDetails = {
          id: response.id,
          titulo: response.titulo,
          descripcion: response.descripcion,
          ubicacion: response.ubicacion,
          empresaNombre: response.empresaNombre,
          tipoTrabajo: response.tipoTrabajo,
          nivelExperiencia: response.nivelExperiencia,
          salarioFormateado: response.salarioFormateado,
          tiempoPublicacion: response.tiempoPublicacion,
          areaTrabajo: response.areaTrabajo,
          beneficios: response.beneficios,
          requisitos: response.requisitos,
          aplicacionesRecibidas: response.aplicacionesRecibidas,
        };
        setJob(offerData);
      } catch (err) {
        setError((err as Error).message || 'Error al cargar los detalles de la oferta');
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetails();
  }, [id]);

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
          <Text className="text-sm text-gray-500">• {job.nivelExperiencia}</Text>
        </View>
        <Text className="text-lg font-poppins-semibold text-gray-700 mb-2">Descripción</Text>
        <Text className="text-gray-600 mb-4">{job.descripcion}</Text>
        <Text className="text-lg font-poppins-semibold text-gray-700 mb-2">Área de Trabajo</Text>
        <Text className="text-gray-600 mb-4">{job.areaTrabajo}</Text>
        {job.beneficios && (
          <>
            <Text className="text-lg font-poppins-semibold text-gray-700 mb-2">Beneficios</Text>
            <Text className="text-gray-600 mb-4">{job.beneficios}</Text>
          </>
        )}
        {job.requisitos && (
          <>
            <Text className="text-lg font-poppins-semibold text-gray-700 mb-2">Requisitos</Text>
            <Text className="text-gray-600 mb-4">{job.requisitos}</Text>
          </>
        )}
        <Text className="text-lg font-poppins-semibold text-gray-700 mb-2">Salario</Text>
        <Text className="text-gray-600 mb-4">{job.salarioFormateado}</Text>
        <Text className="text-lg font-poppins-semibold text-gray-700 mb-2">Aplicaciones Recibidas</Text>
        <Text className="text-gray-600 mb-4">{job.aplicacionesRecibidas}</Text>
        <Text className="text-sm text-gray-400 mb-4">{job.tiempoPublicacion}</Text>
        <TouchableOpacity
          onPress={() => Alert.alert('Aplicar', 'Función de aplicación simulada')}
          className="bg-primary rounded-full px-6 py-2 mt-4"
        >
          <Text className="text-white font-poppins-semibold text-base text-center">Aplicar</Text>
        </TouchableOpacity>
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