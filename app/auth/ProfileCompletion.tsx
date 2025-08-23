import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Keyboard, Pressable, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { createProfile, uploadProfilePhoto } from '../services/api';

const ProfileCompletion = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;
  const [step, setStep] = useState(1);
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
    foto: null as ImagePicker.ImagePickerAsset | null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (step === 1 && (!formData.tipo_perfil || !formData.descripcion || !formData.ubicacion)) {
      setError('Por favor, completa los campos obligatorios');
      return;
    }
    if (step === 2 && (!formData.experiencia || !formData.educacion)) {
      setError('Por favor, completa los campos obligatorios');
      return;
    }
    if (step === 3 && (!formData.habilidades || !formData.foto)) {
      setError('Por favor, completa los campos obligatorios y selecciona una foto');
      return;
    }
    setError('');
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
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
      setFormData({ ...formData, foto: result.assets[0] });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const profileResponse = await createProfile({
        tipo_perfil: formData.tipo_perfil,
        descripcion: formData.descripcion,
        ubicacion: formData.ubicacion,
        telefono: formData.telefono,
        sitio_web: formData.sitio_web,
        experiencia: formData.experiencia,
        educacion: formData.educacion,
        certificaciones: formData.certificaciones,
        intereses: formData.intereses,
      });

      if (formData.foto) {
        const formDataPhoto = new FormData();
        formDataPhoto.append('foto', {
          uri: formData.foto.uri,
          name: `profile_${profileResponse.perfil_id}.jpg`,
          type: 'image/jpeg',
        } as any);
        await uploadProfilePhoto(profileResponse.perfil_id, formDataPhoto);
      }

      Alert.alert('Éxito', 'Perfil completado correctamente');
      router.navigate('../(tabs)/home');
    } catch (err) {
      setError((err as Error).message || 'Error al guardar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEditing = () => {
    Keyboard.dismiss();
  };

  const renderStepIndicator = () => (
    <View className="flex-row justify-center mb-4">
      {[1, 2, 3].map((s) => (
        <View
          key={s}
          className={`h-2 w-2 rounded-full mx-1 ${step === s ? 'bg-primary' : 'bg-gray-300'}`}
        />
      ))}
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="mt-24 justify-center items-center flex-col">
        <View className="justify-center items-center gap-3 mb-12">
          <Image
            source={require('../../assets/images/HireMatch-Logo.png')}
            className="size-40"
          />
          <Text
            style={{ fontFamily: 'Poppins-Regular' }}
            className="text-3xl text-primary font-bold"
          >
            Completar Perfil
          </Text>
          <Text className="text-gray-700 text-center">
            {step === 1 ? 'Información básica' : step === 2 ? 'Experiencia y educación' : 'Habilidades y foto'}
          </Text>
        </View>

        {renderStepIndicator()}

        <View className="gap-5 px-14 w-full">
          {step === 1 && (
            <>
              <View className="flex-row justify-between mb-4">
                <Pressable
                  onPress={() => setFormData({ ...formData, tipo_perfil: 'postulante' })}
                  className={`flex-1 p-3 rounded-xl mr-2 ${formData.tipo_perfil === 'postulante' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                >
                  <Text className={`text-center font-semibold ${formData.tipo_perfil === 'postulante' ? 'text-white' : 'text-gray-700'}`}>
                    Postulante
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setFormData({ ...formData, tipo_perfil: 'empresa' })}
                  className={`flex-1 p-3 rounded-xl ml-2 ${formData.tipo_perfil === 'empresa' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                >
                  <Text className={`text-center font-semibold ${formData.tipo_perfil === 'empresa' ? 'text-white' : 'text-gray-700'}`}>
                    Empresa
                  </Text>
                </Pressable>
              </View>
              <TextInput
                className="border border-gray-300 rounded-xl p-3 w-full mb-4"
                placeholder="Descripción (máx. 255 caracteres)"
                value={formData.descripcion}
                onChangeText={(text) => setFormData({ ...formData, descripcion: text.slice(0, 255) })}
                multiline
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
              <TextInput
                className="border border-gray-300 rounded-xl p-3 w-full mb-4"
                placeholder="Ubicación (máx. 150 caracteres)"
                value={formData.ubicacion}
                onChangeText={(text) => setFormData({ ...formData, ubicacion: text.slice(0, 150) })}
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
              <TextInput
                className="border border-gray-300 rounded-xl p-3 w-full mb-4"
                placeholder="Teléfono (máx. 20 caracteres)"
                value={formData.telefono}
                onChangeText={(text) => setFormData({ ...formData, telefono: text.slice(0, 20) })}
                keyboardType="phone-pad"
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
              <TextInput
                className="border border-gray-300 rounded-xl p-3 w-full mb-4"
                placeholder="Sitio web (máx. 255 caracteres)"
                value={formData.sitio_web}
                onChangeText={(text) => setFormData({ ...formData, sitio_web: text.slice(0, 255) })}
                keyboardType="url"
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </>
          )}

          {step === 2 && (
            <>
              <TextInput
                className="border border-gray-300 rounded-xl p-3 w-full mb-4"
                placeholder="Experiencia laboral"
                value={formData.experiencia}
                onChangeText={(text) => setFormData({ ...formData, experiencia: text })}
                multiline
                numberOfLines={4}
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
              <TextInput
                className="border border-gray-300 rounded-xl p-3 w-full mb-4"
                placeholder="Educación"
                value={formData.educacion}
                onChangeText={(text) => setFormData({ ...formData, educacion: text })}
                multiline
                numberOfLines={4}
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
              <TextInput
                className="border border-gray-300 rounded-xl p-3 w-full mb-4"
                placeholder="Certificaciones"
                value={formData.certificaciones}
                onChangeText={(text) => setFormData({ ...formData, certificaciones: text })}
                multiline
                numberOfLines={4}
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </>
          )}

          {step === 3 && (
            <>
              <TextInput
                className="border border-gray-300 rounded-xl p-3 w-full mb-4"
                placeholder="Habilidades (máx. 255 caracteres)"
                value={formData.habilidades}
                onChangeText={(text) => setFormData({ ...formData, habilidades: text.slice(0, 255) })}
                multiline
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
              <TextInput
                className="border border-gray-300 rounded-xl p-3 w-full mb-4"
                placeholder="Intereses"
                value={formData.intereses}
                onChangeText={(text) => setFormData({ ...formData, intereses: text })}
                multiline
                numberOfLines={4}
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
              <Pressable onPress={pickImage} disabled={loading}>
                <Text
                  className={`text-center text-white bg-primary p-3 rounded-xl font-semibold mb-4 ${
                    loading ? 'opacity-50' : ''
                  }`}
                >
                  {formData.foto ? 'Cambiar Foto' : 'Seleccionar Foto de Perfil'}
                </Text>
              </Pressable>
              {formData.foto && (
                <Image
                  source={{ uri: formData.foto.uri }}
                  className="w-24 h-24 rounded-full mx-auto"
                />
              )}
            </>
          )}

          {error ? (
            <Text className="text-red-500 text-center">{error}</Text>
          ) : null}

          <View className="flex-row justify-between">
            {step > 1 && (
              <Pressable onPress={handleBack} disabled={loading}>
                <Text
                  className={`text-center text-primary p-3 rounded-xl font-semibold border border-primary ${
                    loading ? 'opacity-50' : ''
                  }`}
                >
                  Anterior
                </Text>
              </Pressable>
            )}
            <Pressable onPress={handleNext} disabled={loading}>
              <Text
                className={`text-center text-white bg-primary p-3 rounded-xl font-semibold ${
                  loading ? 'opacity-50' : ''
                }`}
              >
                {loading ? 'Guardando...' : step === 3 ? 'Finalizar' : 'Siguiente'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ProfileCompletion;