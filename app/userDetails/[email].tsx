import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getPerfilPublicoPorEmail } from '../services/api';

// Interfaz para los datos del perfil completo
interface UserProfileDetails {
  perfilId: number;
  nombreCompleto: string;
  email: string;
  tipoPerfil: string;
  descripcion?: string;
  ubicacion?: string;
  habilidades?: string;
  experiencia?: string;
  educacion?: string;
  certificaciones?: string;
  intereses?: string;
  fotoUrl?: string;
}

const UserDetails = () => {
  const { email } = useLocalSearchParams() as { email: string };
  const router = useRouter();
  const [user, setUser] = useState<UserProfileDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        if (!email || typeof email !== 'string') {
          throw new Error('Email no válido');
        }
        
        // Llamada real a tu API
        const response = await getPerfilPublicoPorEmail(email);
        
        const userData: UserProfileDetails = {
          perfilId: response.perfilId,
          nombreCompleto: response.nombreCompleto,
          email: response.email,
          tipoPerfil: response.tipoPerfil,
          descripcion: response.descripcion,
          ubicacion: response.ubicacion,
          habilidades: response.habilidades,
          experiencia: response.experiencia,
          educacion: response.educacion,
          certificaciones: response.certificaciones,
          intereses: response.intereses,
          fotoUrl: response.fotoUrl
        };
        
        setUser(userData);

      } catch (err) {
        console.error('Error fetching user details:', (err as Error).message || err);
        setError((err as Error).message || 'Error al cargar los detalles del perfil');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserDetails();
  }, [email]);

  const handleContact = () => {
    if (user?.email) {
      Linking.openURL(`mailto:${user.email}?subject=Oportunidad Laboral`);
    }
  };

  const handleFavorite = () => {
    Alert.alert('Favorito', 'Usuario agregado a favoritos');
  };

  const renderSection = (title: string, content?: string, icon: string = "info") => {
    if (!content) return null;
    
    return (
      <View className="mb-6">
        <View className="flex-row items-center mb-3">
          <Icon name={icon} size={24} color="#005187" />
          <Text className="text-lg font-poppins-semibold text-gray-700 ml-3">{title}</Text>
        </View>
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <Text className="text-gray-600 font-poppins leading-relaxed">{content}</Text>
        </View>
      </View>
    );
  };

  const renderSkills = (habilidades?: string) => {
    if (!habilidades) return null;
    
    const skills = habilidades.split(',').map(skill => skill.trim());
    
    return (
      <View className="mb-6">
        <View className="flex-row items-center mb-3">
          <Icon name="build" size={24} color="#005187" />
          <Text className="text-lg font-poppins-semibold text-gray-700 ml-3">Habilidades</Text>
        </View>
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <View className="flex-row flex-wrap">
            {skills.map((skill, index) => (
              <View key={index} className="bg-blue-100 rounded-full px-4 py-2 mr-2 mb-2">
                <Text className="text-sm font-poppins-semibold text-blue-700">{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#005187" />
        <Text className="text-gray-700 mt-2 font-poppins">Cargando perfil...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <Icon name="error-outline" size={64} color="#EF4444" />
        <Text className="text-red-500 font-poppins text-center px-6 mt-4">{error}</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 rounded-full px-6 py-3"
          style={{ backgroundColor: '#005187' }}
        >
          <Text className="text-white font-poppins-semibold">Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <Icon name="person-off" size={64} color="#9CA3AF" />
        <Text className="text-gray-500 font-poppins mt-4">No se encontró el perfil.</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 rounded-full px-6 py-3"
          style={{ backgroundColor: '#005187' }}
        >
          <Text className="text-white font-poppins-semibold">Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header with Profile Photo and Basic Info */}
        <View style={{ backgroundColor: '#005187' }} className="px-6 pt-6 pb-8">
          <View className="items-center">
            {user.fotoUrl ? (
              <Image
                source={{ uri: user.fotoUrl }}
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                style={{ backgroundColor: '#F3F4F6' }}
              />
            ) : (
              <View className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg items-center justify-center">
                <Icon name="person" size={48} color="#005187" />
              </View>
            )}
            <Text className="text-2xl font-poppins-bold text-white mt-4 text-center">
              {user.nombreCompleto}
            </Text>
            <Text className="text-blue-100 font-poppins mt-1">{user.email}</Text>
            {user.ubicacion && (
              <View className="flex-row items-center mt-2">
                <Icon name="location-on" size={16} color="white" />
                <Text className="text-white font-poppins ml-1">{user.ubicacion}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Content */}
        <View className="px-6 py-6 -mt-4 bg-gray-50 rounded-t-3xl">
          {renderSection("Descripción", user.descripcion, "person")}
          {renderSection("Experiencia Laboral", user.experiencia, "work")}
          {renderSection("Educación", user.educacion, "school")}
          {renderSkills(user.habilidades)}
          {renderSection("Certificaciones", user.certificaciones, "verified")}
          {renderSection("Intereses", user.intereses, "interests")}

          {/* Action Buttons */}
          <View className="flex-col mt-8">
            <TouchableOpacity
              onPress={handleContact}
              className="rounded-full px-6 py-4 flex-row items-center justify-center mb-4"
              style={{ backgroundColor: '#005187' }}
            >
              <Icon name="email" size={24} color="white" />
              <Text className="text-white font-poppins-semibold text-lg ml-3">Contactar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleFavorite}
              className="bg-yellow-500 rounded-full px-6 py-4 flex-row items-center justify-center mb-4"
            >
              <Icon name="star" size={24} color="white" />
              <Text className="text-white font-poppins-semibold text-lg ml-3">Agregar a Favoritos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-gray-200 rounded-full px-6 py-4"
            >
              <Text className="text-gray-700 font-poppins-semibold text-lg text-center">Volver</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserDetails;