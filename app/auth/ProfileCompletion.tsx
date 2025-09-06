import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Keyboard, Pressable, ScrollView, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { createProfile, updateUserActivo, uploadProfilePhoto } from '../services/api';

// Lista de sugerencias para habilidades (client-side)
const habilidadesSugeridas = [
  'Comunicación',
  'Trabajo en equipo',
  'Resolución de problemas',
  'Gestión de proyectos',
  'Programación',
  'Diseño gráfico',
  'Atención al cliente',
  'Ventas',
  'Marketing digital',
  'Análisis de datos',
  'Gestión del tiempo',
  'Liderazgo',
];

// Lista de sugerencias para experiencia (client-side)
const experienciasSugeridas = [
  'Desarrollador de Software',
  'Atención al Cliente',
  'Gestión de Proyectos',
  'Diseñador Gráfico',
  'Vendedor',
  'Analista de Datos',
  'Asistente Administrativo',
  'Marketing',
  'Contador',
  'Recursos Humanos',
  'Soporte Técnico',
  'Docente',
];

const ProfileCompletion = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    tipo_perfil: 'postulante' as 'postulante' | 'empresa',
    nombre_empresa: '',
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

  // Función para agregar sugerencias a habilidades o experiencia
  const addSuggestion = (field: 'habilidades' | 'experiencia', suggestion: string) => {
    const currentValue = formData[field];
    const maxLength = field === 'habilidades' ? 500 : 2000;
    let newValue = currentValue ? `${currentValue}, ${suggestion}` : suggestion;

    // Respetar el límite de caracteres
    if (newValue.length > maxLength) {
      newValue = newValue.slice(0, maxLength);
    }

    setFormData({ ...formData, [field]: newValue });
  };

  // Client-side validation
  const validateStep = () => {
    if (step === 1) {
      if (!formData.tipo_perfil) {
        return 'Selecciona un tipo de perfil';
      }
      if (formData.tipo_perfil === 'empresa' && (!formData.nombre_empresa || formData.nombre_empresa.trim() === '')) {
        return 'El nombre de la empresa es obligatorio';
      }
      if (formData.nombre_empresa && formData.nombre_empresa.length > 150) {
        return 'El nombre de la empresa no puede exceder los 150 caracteres';
      }
      if (!formData.descripcion || formData.descripcion.trim() === '') {
        return 'La descripción es obligatoria';
      }
      if (formData.descripcion.length > 1000) {
        return 'La descripción no puede exceder los 1000 caracteres';
      }
      if (formData.ubicacion && formData.ubicacion.length > 255) {
        return 'La ubicación no puede exceder los 255 caracteres';
      }
      if (formData.telefono && !/^[+\d\s\-()]+$/.test(formData.telefono)) {
        return 'El formato del teléfono no es válido';
      }
      if (formData.sitio_web && !/^(https?:\/\/)?(www\.)?[a-zA-Z0-9\-\.]+.[a-zA-Z]{2,}(\/.*)?$/.test(formData.sitio_web)) {
        return 'El formato de la URL no es válido';
      }
    }
    if (step === 2 && formData.tipo_perfil === 'postulante') {
      if (!formData.experiencia || formData.experiencia.trim() === '') {
        return 'La experiencia es obligatoria';
      }
      if (formData.experiencia.length > 2000) {
        return 'La experiencia no puede exceder los 2000 caracteres';
      }
      if (!formData.educacion || formData.educacion.trim() === '') {
        return 'La educación es obligatoria';
      }
      if (formData.educacion.length > 2000) {
        return 'La educación no puede exceder los 2000 caracteres';
      }
      if (formData.certificaciones && formData.certificaciones.length > 2000) {
        return 'Las certificaciones no pueden exceder los 2000 caracteres';
      }
    }
    if (step === 3) {
      if (!formData.habilidades || formData.habilidades.trim() === '') {
        return 'Las habilidades son obligatorias';
      }
      if (formData.habilidades.length > 500) {
        return 'Las habilidades no pueden exceder los 500 caracteres';
      }
      if (formData.intereses && formData.intereses.length > 500) {
        return 'Los intereses no pueden exceder los 500 caracteres';
      }
      if (!formData.foto) {
        return 'Selecciona una foto de perfil';
      }
    }
    return '';
  };

  const handleNext = () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
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
      if (result.assets[0].fileSize && result.assets[0].fileSize > 5 * 1024 * 1024) {
        setError('La imagen no puede exceder los 5MB');
        return;
      }
      setFormData({ ...formData, foto: result.assets[0] });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const profileResponse = await createProfile({
        tipo_perfil: formData.tipo_perfil,
        nombre_empresa: formData.nombre_empresa,
        descripcion: formData.descripcion,
        ubicacion: formData.ubicacion,
        telefono: formData.telefono,
        sitio_web: formData.sitio_web,
        experiencia: formData.experiencia,
        habilidades: formData.habilidades,
        educacion: formData.educacion,
        certificaciones: formData.certificaciones,
        intereses: formData.intereses,
      });

      if (formData.foto) {
        const formDataPhoto = new FormData();
        formDataPhoto.append('foto', {
          uri: formData.foto.uri,
          name: `profile_${profileResponse.perfilId}.jpg`,
          type: 'image/jpeg',
        } as any);
        await uploadProfilePhoto(profileResponse.perfilId, formDataPhoto);
      }

      await updateUserActivo();

      Alert.alert('Éxito', profileResponse.mensaje || 'Perfil completado correctamente');
      router.navigate('/(tabs)/profile');
    } catch (err) {
      console.error('Profile completion error:', err);
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
      <ScrollView className="flex-1">
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
                    onPress={() => setFormData({ ...formData, tipo_perfil: 'postulante', nombre_empresa: '' })}
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
                {formData.tipo_perfil === 'empresa' && (
                  <TextInput
                    className="border border-gray-300 rounded-xl p-3 w-full mb-4"
                    placeholder="Nombre de la empresa (máx. 150 caracteres)"
                    value={formData.nombre_empresa}
                    onChangeText={(text) => setFormData({ ...formData, nombre_empresa: text.slice(0, 150) })}
                    editable={!loading}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmitEditing}
                  />
                )}
                <TextInput
                  className="border border-gray-300 rounded-xl p-3 w-full mb-4"
                  placeholder="Descripción (máx. 1000 caracteres)"
                  value={formData.descripcion}
                  onChangeText={(text) => setFormData({ ...formData, descripcion: text.slice(0, 1000) })}
                  multiline
                  editable={!loading}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmitEditing}
                />
                <TextInput
                  className="border border-gray-300 rounded-xl p-3 w-full mb-4"
                  placeholder="Ubicación (máx. 255 caracteres)"
                  value={formData.ubicacion}
                  onChangeText={(text) => setFormData({ ...formData, ubicacion: text.slice(0, 255) })}
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

            {step === 2 && formData.tipo_perfil === 'postulante' && (
              <>
                <View>
                  <TextInput
                    className="border border-gray-300 rounded-xl p-3 w-full mb-2"
                    placeholder="Experiencia laboral (máx. 2000 caracteres)"
                    value={formData.experiencia}
                    onChangeText={(text) => setFormData({ ...formData, experiencia: text.slice(0, 2000) })}
                    multiline
                    numberOfLines={4}
                    editable={!loading}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmitEditing}
                  />
                  <View className="flex-row flex-wrap gap-2 mb-4">
                    {experienciasSugeridas.map((suggestion, index) => (
                      <Pressable
                        key={index}
                        onPress={() => addSuggestion('experiencia', suggestion)}
                        className="bg-gray-200 rounded-full px-3 py-1"
                      >
                        <Text className="text-gray-700 text-sm font-poppins">{suggestion}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                <TextInput
                  className="border border-gray-300 rounded-xl p-3 w-full mb-4"
                  placeholder="Educación (máx. 2000 caracteres)"
                  value={formData.educacion}
                  onChangeText={(text) => setFormData({ ...formData, educacion: text.slice(0, 2000) })}
                  multiline
                  numberOfLines={4}
                  editable={!loading}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmitEditing}
                />
                <TextInput
                  className="border border-gray-300 rounded-xl p-3 w-full mb-4"
                  placeholder="Certificaciones (máx. 2000 caracteres)"
                  value={formData.certificaciones}
                  onChangeText={(text) => setFormData({ ...formData, certificaciones: text.slice(0, 2000) })}
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
                <View>
                  <TextInput
                    className="border border-gray-300 rounded-xl p-3 w-full mb-2"
                    placeholder="Habilidades (máx. 500 caracteres)"
                    value={formData.habilidades}
                    onChangeText={(text) => setFormData({ ...formData, habilidades: text.slice(0, 500) })}
                    multiline
                    editable={!loading}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmitEditing}
                  />
                  <View className="flex-row flex-wrap gap-2 mb-4">
                    {habilidadesSugeridas.map((suggestion, index) => (
                      <Pressable
                        key={index}
                        onPress={() => addSuggestion('habilidades', suggestion)}
                        className="bg-gray-200 rounded-full px-3 py-1"
                      >
                        <Text className="text-gray-700 text-sm font-poppins">{suggestion}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                <TextInput
                  className="border border-gray-300 rounded-xl p-3 w-full mb-4"
                  placeholder="Intereses (máx. 500 caracteres)"
                  value={formData.intereses}
                  onChangeText={(text) => setFormData({ ...formData, intereses: text.slice(0, 500) })}
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
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

export default ProfileCompletion;