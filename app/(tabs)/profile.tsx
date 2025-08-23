import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getUserProfile } from '../services/api';

const Profile = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    descripcion: '',
    ubicacion: '',
    telefono: '',
    sitio_web: '',
    experiencia: '',
    habilidades: '',
    educacion: '',
    certificaciones: '',
    intereses: '',
    tipo_perfil: 'postulante' as 'postulante' | 'empresa',
    foto: null as string | null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const profile = await getUserProfile();
        setFormData({
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
        });
      } catch (err) {
        setError((err as Error).message || 'Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Icon name="autorenew" size={40} color="#3B82F6" />
        <Text className="text-gray-700 text-lg font-poppins mt-2">Cargando perfil...</Text>
      </View>
    );
  }

  return (
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
  );
};

export default Profile;