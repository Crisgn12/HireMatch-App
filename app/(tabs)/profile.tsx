import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getUserProfile, updateUserProfile } from '../services/api';

// Definir el tipo para los datos del formulario
interface ProfileFormData {
  descripcion: string;
  ubicacion: string;
  telefono: string;
  sitio_web: string;
  experiencia: string;
  habilidades: string;
  educacion: string;
  certificaciones: string;
  intereses: string;
  tipo_perfil: 'postulante' | 'empresa';
  foto: string | null;
}

const Profile = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<ProfileFormData>({
    descripcion: '',
    ubicacion: '',
    telefono: '',
    sitio_web: '',
    experiencia: '',
    habilidades: '',
    educacion: '',
    certificaciones: '',
    intereses: '',
    tipo_perfil: 'postulante',
    foto: null,
  });
  const [modalFormData, setModalFormData] = useState<ProfileFormData>(formData);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Estado para el botón "Guardar"

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const profile = await getUserProfile();
        const updatedFormData = {
          descripcion: profile.descripcion || '',
          ubicacion: profile.ubicacion || '',
          telefono: profile.telefono || '',
          sitio_web: profile.sitio_web || '',
          experiencia: profile.experiencia || '',
          habilidades: profile.habilidades || '',
          educacion: profile.educacion || '',
          certificaciones: profile.certificaciones || '',
          intereses: profile.intereses || '',
          tipo_perfil: profile.tipoPerfil,
          foto: profile.fotoUrl || null,
        };
        setFormData(updatedFormData);
        setModalFormData(updatedFormData);
      } catch (err) {
        setError((err as Error).message || 'Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Manejar cambios en los campos del formulario del modal
  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setModalFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Guardar los cambios del perfil
  const handleSave = async () => {
    console.log('handleSave ejecutado con payload:', modalFormData); // Depuración
    if (JSON.stringify(modalFormData) === JSON.stringify(formData)) {
      console.log('No hay cambios para guardar');
      setModalVisible(false);
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        descripcion: modalFormData.descripcion,
        ubicacion: modalFormData.ubicacion,
        telefono: modalFormData.telefono,
        sitioWeb: modalFormData.sitio_web,
        experiencia: modalFormData.experiencia,
        habilidades: modalFormData.habilidades,
        educacion: modalFormData.educacion,
        certificaciones: modalFormData.certificaciones,
        intereses: modalFormData.intereses,
      };
      console.log('Enviando solicitud PUT con payload:', payload); // Depuración
      await updateUserProfile(payload);
      setFormData((prev) => ({ ...prev, ...modalFormData }));
      setModalVisible(false);
      setError('');
      Toast.show({
        type: 'success',
        text1: 'Perfil actualizado',
        text2: 'Los cambios se han guardado correctamente.',
      });
    } catch (err) {
      const errorMessage = (err as Error).message || 'Error al actualizar el perfil';
      console.error('Error en handleSave:', errorMessage); // Depuración
      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Cancelar la edición y cerrar el modal
  const handleCancel = () => {
    setModalFormData(formData);
    setModalVisible(false);
    setError('');
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Icon name="autorenew" size={40} color="#3B82F6" />
        <Text className="text-gray-700 text-lg font-poppins mt-2">Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView className="flex-1 bg-gray-50">
        <View className="mt-12 px-6">
          {/* Header Section */}
          <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <View className="items-center">
              <Image
                source={require('../../assets/images/HireMatch-Logo.png')}
                className="w-32 h-32"
              />
              <Image
                source={formData.foto ? { uri: formData.foto } : require('../../assets/images/default-profile.png')}
                className="w-28 h-28 rounded-full border-4 border-primary shadow-md mt-4"
              />
              <Text
                style={{ fontFamily: 'Poppins-SemiBold' }}
                className="text-2xl text-primary mt-4"
              >
                Mi Perfil
              </Text>
              <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600 text-base">
                Visualiza tu información
              </Text>
              <View className={`mt-3 px-4 py-1 rounded-full ${formData.tipo_perfil === 'postulante' ? 'bg-blue-100' : 'bg-green-100'}`}>
                <Text
                  style={{ fontFamily: 'Poppins-SemiBold' }}
                  className={`text-sm capitalize ${formData.tipo_perfil === 'postulante' ? 'text-blue-600' : 'text-green-600'}`}
                >
                  {formData.tipo_perfil}
                </Text>
              </View>
              {/* Botón Editar Perfil */}
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className="mt-4 bg-primary rounded-full px-6 py-2"
              >
                <Text
                  style={{ fontFamily: 'Poppins-SemiBold' }}
                  className="text-white text-base"
                >
                  Editar Perfil
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Error Message */}
          {error ? (
            <View className="bg-red-50 border border-red-300 rounded-xl p-4 mb-6">
              <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-red-600 text-center">
                {error}
              </Text>
            </View>
          ) : null}

          {/* Personal Info Section */}
          <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-lg text-gray-800 mb-4">
              Información Personal
            </Text>
            <View className="flex-row items-center mb-3">
              <Icon name="info-outline" size={20} color="#4B5563" />
              <View className="ml-3 flex-1">
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 text-sm">
                  Descripción
                </Text>
                <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                  {formData.descripcion || 'No disponible'}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <Icon name="location-on" size={20} color="#4B5563" />
              <View className="ml-3 flex-1">
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 text-sm">
                  Ubicación
                </Text>
                <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                  {formData.ubicacion || 'No disponible'}
                </Text>
              </View>
            </View>
          </View>

          {/* Contact Info Section */}
          <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-lg text-gray-800 mb-4">
              Información de Contacto
            </Text>
            <View className="flex-row flex-wrap -mx-2">
              <View className="w-1/2 px-2 mb-3">
                <View className="flex-row items-center">
                  <Icon name="phone" size={20} color="#4B5563" />
                  <View className="ml-3 flex-1">
                    <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 text-sm">
                      Teléfono
                    </Text>
                    <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                      {formData.telefono || 'No disponible'}
                    </Text>
                  </View>
                </View>
              </View>
              <View className="w-1/2 px-2 mb-3">
                <View className="flex-row items-center">
                  <Icon name="public" size={20} color="#4B5563" />
                  <View className="ml-3 flex-1">
                    <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 text-sm">
                      Sitio Web
                    </Text>
                    <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                      {formData.sitio_web || 'No disponible'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Professional Info Section */}
          <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-lg text-gray-800 mb-4">
              Información Profesional
            </Text>
            <View className="flex-row items-center mb-3">
              <Icon name="work-outline" size={20} color="#4B5563" />
              <View className="ml-3 flex-1">
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 text-sm">
                  Experiencia
                </Text>
                <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                  {formData.experiencia || 'No disponible'}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center mb-3">
              <Icon name="school" size={20} color="#4B5563" />
              <View className="ml-3 flex-1">
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 text-sm">
                  Educación
                </Text>
                <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                  {formData.educacion || 'No disponible'}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <Icon name="verified" size={20} color="#4B5563" />
              <View className="ml-3 flex-1">
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 text-sm">
                  Certificaciones
                </Text>
                <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                  {formData.certificaciones || 'No disponible'}
                </Text>
              </View>
            </View>
          </View>

          {/* Additional Info Section */}
          <View className="bg-white rounded-2xl shadow-md p-6 mb-8">
            <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-lg text-gray-800 mb-4">
              Información Adicional
            </Text>
            <View className="flex-row items-center mb-3">
              <Icon name="star-outline" size={20} color="#4B5563" />
              <View className="ml-3 flex-1">
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 text-sm">
                  Habilidades
                </Text>
                <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                  {formData.habilidades || 'No disponible'}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <Icon name="favorite-outline" size={20} color="#4B5563" />
              <View className="ml-3 flex-1">
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 text-sm">
                  Intereses
                </Text>
                <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                  {formData.intereses || 'No disponible'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal para Editar Perfil */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancel}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl p-6 w-11/12 max-w-md h-5/6">
            <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-xl text-primary mb-4">
              Editar Perfil
            </Text>
            <ScrollView>
              <View className="mb-4">
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 text-sm mb-1">
                  Descripción
                </Text>
                <TextInput
                  style={{ fontFamily: 'Poppins-Regular' }}
                  className="border border-gray-300 rounded-lg p-2 text-gray-600"
                  value={modalFormData.descripcion}
                  onChangeText={(text) => handleInputChange('descripcion', text)}
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
                  value={modalFormData.ubicacion}
                  onChangeText={(text) => handleInputChange('ubicacion', text)}
                />
              </View>
              <View className="mb-4">
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 text-sm mb-1">
                  Teléfono
                </Text>
                <TextInput
                  style={{ fontFamily: 'Poppins-Regular' }}
                  className="border border-gray-300 rounded-lg p-2 text-gray-600"
                  value={modalFormData.telefono}
                  onChangeText={(text) => handleInputChange('telefono', text)}
                  keyboardType="phone-pad"
                />
              </View>
              <View className="mb-4">
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 text-sm mb-1">
                  Sitio Web
                </Text>
                <TextInput
                  style={{ fontFamily: 'Poppins-Regular' }}
                  className="border border-gray-300 rounded-lg p-2 text-gray-600"
                  value={modalFormData.sitio_web}
                  onChangeText={(text) => handleInputChange('sitio_web', text)}
                  keyboardType="url"
                />
              </View>
              <View className="mb-4">
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 text-sm mb-1">
                  Experiencia
                </Text>
                <TextInput
                  style={{ fontFamily: 'Poppins-Regular' }}
                  className="border border-gray-300 rounded-lg p-2 text-gray-600"
                  value={modalFormData.experiencia}
                  onChangeText={(text) => handleInputChange('experiencia', text)}
                  multiline
                />
              </View>
              <View className="mb-4">
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 text-sm mb-1">
                  Educación
                </Text>
                <TextInput
                  style={{ fontFamily: 'Poppins-Regular' }}
                  className="border border-gray-300 rounded-lg p-2 text-gray-600"
                  value={modalFormData.educacion}
                  onChangeText={(text) => handleInputChange('educacion', text)}
                  multiline
                />
              </View>
              <View className="mb-4">
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 text-sm mb-1">
                  Certificaciones
                </Text>
                <TextInput
                  style={{ fontFamily: 'Poppins-Regular' }}
                  className="border border-gray-300 rounded-lg p-2 text-gray-600"
                  value={modalFormData.certificaciones}
                  onChangeText={(text) => handleInputChange('certificaciones', text)}
                  multiline
                />
              </View>
              <View className="mb-4">
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 text-sm mb-1">
                  Habilidades
                </Text>
                <TextInput
                  style={{ fontFamily: 'Poppins-Regular' }}
                  className="border border-gray-300 rounded-lg p-2 text-gray-600"
                  value={modalFormData.habilidades}
                  onChangeText={(text) => handleInputChange('habilidades', text)}
                  multiline
                />
              </View>
              <View className="mb-4">
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 text-sm mb-1">
                  Intereses
                </Text>
                <TextInput
                  style={{ fontFamily: 'Poppins-Regular' }}
                  className="border border-gray-300 rounded-lg p-2 text-gray-600"
                  value={modalFormData.intereses}
                  onChangeText={(text) => handleInputChange('intereses', text)}
                  multiline
                />
              </View>
            </ScrollView>
            <View className="flex-row justify-between mt-4">
              <TouchableOpacity
                onPress={handleCancel}
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
                onPress={handleSave}
                disabled={isSaving}
                className={`bg-primary rounded-full px-6 py-2 ${isSaving ? 'opacity-50' : ''}`}
              >
                <Text
                  style={{ fontFamily: 'Poppins-SemiBold' }}
                  className="text-white text-base"
                >
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default Profile;