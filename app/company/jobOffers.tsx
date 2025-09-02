import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { createJobOffer, getCompanyId, getJobOffersByCompany } from '../services/api';

// Interfaz para los datos del formulario
interface JobOfferFormData {
  titulo: string;
  descripcion: string;
  ubicacion: string;
  tipoTrabajo: 'REMOTO' | 'PRESENCIAL' | 'HIBRIDO';
  nivelExperiencia: 'ESTUDIANTE' | 'JUNIOR' | 'SEMI_SENIOR' | 'SENIOR' | 'LEAD' | 'DIRECTOR';
  areaTrabajo: string;
  salarioMinimo: number;
  salarioMaximo: number;
  moneda: 'USD' | 'CRC' | 'EUR' | 'MXN' | 'CAD';
}

// Interfaz para los datos de una oferta laboral
interface JobOffer {
  id: number;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  empresaNombre: string;
  tipoTrabajo: string;
  nivelExperiencia: string;
  salarioFormateado: string;
  tiempoPublicacion: string;
}

const JobOfferComponent = ({ job }: { job: JobOffer }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/jobDetails/${job.id}`)} // Simulación de navegación a detalles
      className="bg-white rounded-lg p-4 mb-4 shadow-md border border-gray-200"
    >
      <Text className="text-lg font-poppins-semibold text-gray-800">{job.titulo}</Text>
      <Text className="text-sm text-gray-600 mt-1">{job.empresaNombre}</Text>
      <View className="flex-row flex-wrap mt-2">
        <Text className="text-sm text-gray-500 mr-2">{job.ubicacion}</Text>
        <Text className="text-sm text-gray-500 mr-2">• {job.tipoTrabajo}</Text>
        <Text className="text-sm text-gray-500">• {job.nivelExperiencia}</Text>
      </View>
      <Text className="text-sm text-gray-700 mt-2">{job.salarioFormateado}</Text>
      <Text className="text-xs text-gray-400 mt-1">{job.tiempoPublicacion}</Text>
    </TouchableOpacity>
  );
};

const JobOffers = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState<JobOfferFormData>({
    titulo: '',
    descripcion: '',
    ubicacion: '',
    tipoTrabajo: 'REMOTO',
    nivelExperiencia: 'ESTUDIANTE',
    areaTrabajo: '',
    salarioMinimo: 0,
    salarioMaximo: 0,
    moneda: 'USD',
  });
  const [error, setError] = useState<string | null>(null);
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobOffers = async () => {
      try {
        const companyId = await getCompanyId();
        const response = await getJobOffersByCompany(companyId);
        const offers = response.content.map((offer: any) => ({
          id: offer.id,
          titulo: offer.titulo,
          descripcion: offer.descripcion,
          ubicacion: offer.ubicacion,
          empresaNombre: offer.empresaNombre,
          tipoTrabajo: offer.tipoTrabajo,
          nivelExperiencia: offer.nivelExperiencia,
          salarioFormateado: offer.salarioFormateado,
          tiempoPublicacion: offer.tiempoPublicacion,
        }));
        setJobOffers(offers);
      } catch (err) {
        setError((err as Error).message || 'Error al cargar las ofertas');
      } finally {
        setLoading(false);
      }
    };
    fetchJobOffers();
  }, []);

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setFormData({
      titulo: '',
      descripcion: '',
      ubicacion: '',
      tipoTrabajo: 'REMOTO',
      nivelExperiencia: 'ESTUDIANTE',
      areaTrabajo: '',
      salarioMinimo: 0,
      salarioMaximo: 0,
      moneda: 'USD',
    });
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      const response = await createJobOffer(formData);
      Alert.alert(
        'Éxito',
        'Oferta creada correctamente',
        [
          { text: 'OK', onPress: () => closeModal() },
        ],
        { cancelable: false }
      );
      // Recargar ofertas después de crear una nueva
      const companyId = await getCompanyId();
      const responseOffers = await getJobOffersByCompany(companyId);
      setJobOffers(responseOffers.content.map((offer: any) => ({
        id: offer.id,
        titulo: offer.titulo,
        descripcion: offer.descripcion,
        ubicacion: offer.ubicacion,
        empresaNombre: offer.empresaNombre,
        tipoTrabajo: offer.tipoTrabajo,
        nivelExperiencia: offer.nivelExperiencia,
        salarioFormateado: offer.salarioFormateado,
        tiempoPublicacion: offer.tiempoPublicacion,
      })));
    } catch (err) {
      const errorMessage = (err as Error).message || 'Error al crear la oferta';
      setError(errorMessage);
      Alert.alert(
        'Error',
        errorMessage,
        [{ text: 'OK' }],
        { cancelable: false }
      );
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-700 font-poppins">Cargando ofertas...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="mt-6 px-6">
        <TouchableOpacity
          onPress={openModal}
          className="mt-4 bg-primary rounded-full px-6 py-2 shadow-md flex-row items-center justify-center mb-10"
        >
          <Icon name="add" size={25} color="white" />
          <Text className="text-white font-poppins-semibold text-base">Nueva Oferta</Text>
        </TouchableOpacity>

        {jobOffers.length > 0 ? (
          jobOffers.map((job) => <JobOfferComponent key={job.id} job={job} />)
        ) : (
          <Text className="text-gray-500 text-center mt-4">No hay ofertas disponibles.</Text>
        )}

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white rounded-2xl p-6 w-11/12 max-w-md h-5/6">
              <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-xl text-primary text-center mb-4">
                Crear Nueva Oferta
              </Text>
              <ScrollView>
                <View className="mb-4">
                  <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 text-sm mb-1">
                    Título
                  </Text>
                  <TextInput
                    style={{ fontFamily: 'Poppins-Regular' }}
                    className="border border-gray-300 rounded-lg p-2 text-gray-600"
                    value={formData.titulo}
                    onChangeText={(text) => setFormData({ ...formData, titulo: text })}
                  />
                </View>
                <View className="mb-4">
                  <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 text-sm mb-1">
                    Descripción
                  </Text>
                  <TextInput
                    style={{ fontFamily: 'Poppins-Regular' }}
                    className="border border-gray-300 rounded-lg p-2 text-gray-600"
                    value={formData.descripcion}
                    onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
                    multiline
                  />
                </View>
                <View className="mb-4">
                  <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 text-sm mb-1">
                    Ubicación
                  </Text>
                  <TextInput
                    style={{ fontFamily: 'Poppins-Regular' }}
                    className="border border-gray-300 rounded-lg p-2 text-gray-600"
                    value={formData.ubicacion}
                    onChangeText={(text) => setFormData({ ...formData, ubicacion: text })}
                  />
                </View>
                <View className="mb-4">
                  <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 text-sm mb-1">
                    Tipo de Trabajo
                  </Text>
                  <View className="border border-gray-300 rounded-lg p-2 bg-white">
                    <Picker
                      selectedValue={formData.tipoTrabajo}
                      onValueChange={(itemValue: any) => setFormData({ ...formData, tipoTrabajo: itemValue as 'REMOTO' | 'PRESENCIAL' | 'HIBRIDO' })}
                      style={{ fontFamily: 'Poppins-Regular', color: '#4B5563' }}
                    >
                      <Picker.Item label="Remoto" value="REMOTO" />
                      <Picker.Item label="Presencial" value="PRESENCIAL" />
                      <Picker.Item label="Híbrido" value="HIBRIDO" />
                    </Picker>
                  </View>
                </View>
                <View className="mb-4">
                  <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 text-sm mb-1">
                    Nivel de Experiencia
                  </Text>
                  <View className="border border-gray-300 rounded-lg p-2 bg-white">
                    <Picker
                      selectedValue={formData.nivelExperiencia}
                      onValueChange={(itemValue: any) => setFormData({ ...formData, nivelExperiencia: itemValue as 'ESTUDIANTE' | 'JUNIOR' | 'SEMI_SENIOR' | 'SENIOR' | 'LEAD' | 'DIRECTOR' })}
                      style={{ fontFamily: 'Poppins-Regular', color: '#4B5563' }}
                    >
                      <Picker.Item label="Estudiante/Sin experiencia" value="ESTUDIANTE" />
                      <Picker.Item label="Junior (0-2 años)" value="JUNIOR" />
                      <Picker.Item label="Semi Senior (2-4 años)" value="SEMI_SENIOR" />
                      <Picker.Item label="Senior (4-7 años)" value="SENIOR" />
                      <Picker.Item label="Lead/Team Lead (7+ años)" value="LEAD" />
                      <Picker.Item label="Director/Manager (10+ años)" value="DIRECTOR" />
                    </Picker>
                  </View>
                </View>
                <View className="mb-4">
                  <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 text-sm mb-1">
                    Área de Trabajo
                  </Text>
                  <TextInput
                    style={{ fontFamily: 'Poppins-Regular' }}
                    className="border border-gray-300 rounded-lg p-2 text-gray-600"
                    value={formData.areaTrabajo}
                    onChangeText={(text) => setFormData({ ...formData, areaTrabajo: text })}
                  />
                </View>
                <View className="mb-4">
                  <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 text-sm mb-1">
                    Salario Mínimo
                  </Text>
                  <TextInput
                    style={{ fontFamily: 'Poppins-Regular' }}
                    className="border border-gray-300 rounded-lg p-2 text-gray-600"
                    value={formData.salarioMinimo.toString()}
                    onChangeText={(text) => setFormData({ ...formData, salarioMinimo: parseFloat(text) || 0 })}
                    keyboardType="numeric"
                  />
                </View>
                <View className="mb-4">
                  <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 text-sm mb-1">
                    Salario Máximo
                  </Text>
                  <TextInput
                    style={{ fontFamily: 'Poppins-Regular' }}
                    className="border border-gray-300 rounded-lg p-2 text-gray-600"
                    value={formData.salarioMaximo.toString()}
                    onChangeText={(text) => setFormData({ ...formData, salarioMaximo: parseFloat(text) || 0 })}
                    keyboardType="numeric"
                  />
                </View>
                <View className="mb-4">
                  <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 text-sm mb-1">
                    Moneda
                  </Text>
                  <View className="border border-gray-300 rounded-lg p-2 bg-white">
                    <Picker
                      selectedValue={formData.moneda}
                      onValueChange={(itemValue: any) => setFormData({ ...formData, moneda: itemValue as 'USD' | 'CRC' | 'EUR' | 'MXN' | 'CAD' })}
                      style={{ fontFamily: 'Poppins-Regular', color: '#4B5563' }}
                    >
                      <Picker.Item label="Dólares ($)" value="USD" />
                      <Picker.Item label="Colones (₡)" value="CRC" />
                      <Picker.Item label="Euros (€)" value="EUR" />
                      <Picker.Item label="Pesos Mexicanos ($)" value="MXN" />
                      <Picker.Item label="Dólares Canadienses (C$)" value="CAD" />
                    </Picker>
                  </View>
                </View>
              </ScrollView>
              {error ? (
                <Text className="text-red-500 text-center mb-4">{error}</Text>
              ) : null}
              <View className="flex-row justify-between mt-4">
                <TouchableOpacity
                  onPress={closeModal}
                  className="bg-gray-200 rounded-full px-6 py-2"
                >
                  <Text
                    style={{ fontFamily: 'Poppins-SemiBold' }}
                    className="text-gray-700 text-base"
                  >
                    Cancelar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmit}
                  className="bg-primary rounded-full px-6 py-2"
                >
                  <Text
                    style={{ fontFamily: 'Poppins-SemiBold' }}
                    className="text-white text-base"
                  >
                    Crear
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

export default JobOffers;