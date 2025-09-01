import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { createJobOffer } from '../services/api';

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

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="mt-6 px-6">
        <TouchableOpacity
          onPress={openModal}
          className="mt-4 bg-primary rounded-full px-6 py-2 shadow-md flex-row items-center justify-center"
        >
          <Icon name="add" size={25} color="white" />
          <Text className="text-white font-poppins-semibold text-base">Nueva Oferta</Text>
        </TouchableOpacity>

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