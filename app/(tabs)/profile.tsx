import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, TextInput, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { getUserProfile, updateProfile, uploadProfilePhoto } from '../services/api';

const Profile = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    tipo_perfil: 'postulante' as 'postulante' | 'empresa',
    descripcion: '',
    ubicacion: '',
    telefono: '',
    sitio_web: '',
    experiencia: '',
    habilidades: '',
    educacion: '',
    certificaciones: '',
    intereses: '',
    foto: null as string | null, // URI for display, or null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [newFoto, setNewFoto] = useState<ImagePicker.ImagePickerAsset | null>(null); // For editing photo

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const profile = await getUserProfile();
        setFormData({
          tipo_perfil: profile.tipo_perfil,
          descripcion: profile.descripcion || '',
          ubicacion: profile.ubicacion || '',
          telefono: profile.telefono || '',
          sitio_web: profile.sitio_web || '',
          experiencia: profile.experiencia || '',
          habilidades: profile.habilidades || '',
          educacion: profile.educacion || '',
          certificaciones: profile.certificaciones || '',
          intereses: profile.intereses || '',
          foto: profile.foto_url || null, // Assume API returns foto_url
        });
      } catch (err) {
        setError((err as Error).message || 'Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    setError('');

    try {
      const updatedProfile = await updateProfile(formData);
      if (newFoto) {
        const formDataPhoto = new FormData();
        formDataPhoto.append('foto', {
          uri: newFoto.uri,
          name: `profile_${updatedProfile.perfil_id}.jpg`,
          type: 'image/jpeg',
        } as any);
        await uploadProfilePhoto(updatedProfile.perfil_id, formDataPhoto);
      }
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      setIsEditing(false);
      // Refresh profile data
      setFormData({ ...updatedProfile, foto: newFoto ? newFoto.uri : formData.foto });
      setNewFoto(null);
    } catch (err) {
      setError((err as Error).message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permiso denegado', 'Se requiere acceso a la galería para seleccionar una foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      setNewFoto(result.assets[0]);
    }
  };

  const handleSubmitEditing = () => {
    Keyboard.dismiss();
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-700">Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView className="flex-1 bg-white">
        <View className="mt-24 justify-center items-center flex-col px-14">
          <View className="justify-center items-center gap-3 mb-12">
            <Image
              source={require('../../assets/images/HireMatch-Logo.png')}
              className="size-40"
            />
            <Text
              style={{ fontFamily: 'Poppins-Regular' }}
              className="text-3xl text-primary font-bold"
            >
              Mi Perfil
            </Text>
            <Text className="text-gray-700">Visualiza y edita tu información</Text>
          </View>

          {error ? (
            <Text className="text-red-500 text-center mb-4">{error}</Text>
          ) : null}

          <View className="w-full gap-5">
            {/* Profile Photo */}
            <View className="items-center mb-4">
              {isEditing ? (
                <Pressable onPress={pickImage} disabled={loading}>
                  <Text
                    className={`text-center text-white bg-primary p-3 rounded-xl font-semibold mb-4 ${
                      loading ? 'opacity-50' : ''
                    }`}
                  >
                    {newFoto || formData.foto ? 'Cambiar Foto' : 'Seleccionar Foto de Perfil'}
                  </Text>
                </Pressable>
              ) : null}
              <Image
                source={{ uri: newFoto ? newFoto.uri : formData.foto || 'https://placeholder.com/100x100' }} // Placeholder if no photo
                className="w-24 h-24 rounded-full"
              />
            </View>

            {/* Tipo Perfil (Read-only, as it's likely set during creation) */}
            <Text className="text-gray-700 font-semibold">Tipo de Perfil</Text>
            <Text className="border border-gray-300 rounded-xl p-3 mb-4 capitalize">{formData.tipo_perfil}</Text>

            {/* Descripcion */}
            <Text className="text-gray-700 font-semibold">Descripción</Text>
            {isEditing ? (
              <TextInput
                className="border border-gray-300 rounded-xl p-3 mb-4"
                value={formData.descripcion}
                onChangeText={(text) => setFormData({ ...formData, descripcion: text.slice(0, 255) })}
                multiline
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            ) : (
              <Text className="border border-gray-300 rounded-xl p-3 mb-4">{formData.descripcion || 'No disponible'}</Text>
            )}

            {/* Ubicacion */}
            <Text className="text-gray-700 font-semibold">Ubicación</Text>
            {isEditing ? (
              <TextInput
                className="border border-gray-300 rounded-xl p-3 mb-4"
                value={formData.ubicacion}
                onChangeText={(text) => setFormData({ ...formData, ubicacion: text.slice(0, 150) })}
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            ) : (
              <Text className="border border-gray-300 rounded-xl p-3 mb-4">{formData.ubicacion || 'No disponible'}</Text>
            )}

            {/* Telefono */}
            <Text className="text-gray-700 font-semibold">Teléfono</Text>
            {isEditing ? (
              <TextInput
                className="border border-gray-300 rounded-xl p-3 mb-4"
                value={formData.telefono}
                onChangeText={(text) => setFormData({ ...formData, telefono: text.slice(0, 20) })}
                keyboardType="phone-pad"
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            ) : (
              <Text className="border border-gray-300 rounded-xl p-3 mb-4">{formData.telefono || 'No disponible'}</Text>
            )}

            {/* Sitio Web */}
            <Text className="text-gray-700 font-semibold">Sitio Web</Text>
            {isEditing ? (
              <TextInput
                className="border border-gray-300 rounded-xl p-3 mb-4"
                value={formData.sitio_web}
                onChangeText={(text) => setFormData({ ...formData, sitio_web: text.slice(0, 255) })}
                keyboardType="url"
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            ) : (
              <Text className="border border-gray-300 rounded-xl p-3 mb-4">{formData.sitio_web || 'No disponible'}</Text>
            )}

            {/* Experiencia */}
            <Text className="text-gray-700 font-semibold">Experiencia</Text>
            {isEditing ? (
              <TextInput
                className="border border-gray-300 rounded-xl p-3 mb-4"
                value={formData.experiencia}
                onChangeText={(text) => setFormData({ ...formData, experiencia: text })}
                multiline
                numberOfLines={4}
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            ) : (
              <Text className="border border-gray-300 rounded-xl p-3 mb-4">{formData.experiencia || 'No disponible'}</Text>
            )}

            {/* Habilidades */}
            <Text className="text-gray-700 font-semibold">Habilidades</Text>
            {isEditing ? (
              <TextInput
                className="border border-gray-300 rounded-xl p-3 mb-4"
                value={formData.habilidades}
                onChangeText={(text) => setFormData({ ...formData, habilidades: text.slice(0, 255) })}
                multiline
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            ) : (
              <Text className="border border-gray-300 rounded-xl p-3 mb-4">{formData.habilidades || 'No disponible'}</Text>
            )}

            {/* Educacion */}
            <Text className="text-gray-700 font-semibold">Educación</Text>
            {isEditing ? (
              <TextInput
                className="border border-gray-300 rounded-xl p-3 mb-4"
                value={formData.educacion}
                onChangeText={(text) => setFormData({ ...formData, educacion: text })}
                multiline
                numberOfLines={4}
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            ) : (
              <Text className="border border-gray-300 rounded-xl p-3 mb-4">{formData.educacion || 'No disponible'}</Text>
            )}

            {/* Certificaciones */}
            <Text className="text-gray-700 font-semibold">Certificaciones</Text>
            {isEditing ? (
              <TextInput
                className="border border-gray-300 rounded-xl p-3 mb-4"
                value={formData.certificaciones}
                onChangeText={(text) => setFormData({ ...formData, certificaciones: text })}
                multiline
                numberOfLines={4}
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            ) : (
              <Text className="border border-gray-300 rounded-xl p-3 mb-4">{formData.certificaciones || 'No disponible'}</Text>
            )}

            {/* Intereses */}
            <Text className="text-gray-700 font-semibold">Intereses</Text>
            {isEditing ? (
              <TextInput
                className="border border-gray-300 rounded-xl p-3 mb-4"
                value={formData.intereses}
                onChangeText={(text) => setFormData({ ...formData, intereses: text })}
                multiline
                numberOfLines={4}
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            ) : (
              <Text className="border border-gray-300 rounded-xl p-3 mb-4">{formData.intereses || 'No disponible'}</Text>
            )}

            <Pressable
              onPress={() => {
                if (isEditing) {
                  handleUpdate();
                } else {
                  setIsEditing(true);
                }
              }}
              disabled={loading}
            >
              <Text
                className={`text-center text-white bg-primary p-3 rounded-xl font-semibold mb-8 ${
                  loading ? 'opacity-50' : ''
                }`}
              >
                {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Editar Perfil'}
              </Text>
            </Pressable>

            {isEditing && (
              <Pressable onPress={() => setIsEditing(false)} disabled={loading}>
                <Text
                  className={`text-center text-primary p-3 rounded-xl font-semibold border border-primary mb-8 ${
                    loading ? 'opacity-50' : ''
                  }`}
                >
                  Cancelar
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

export default Profile;