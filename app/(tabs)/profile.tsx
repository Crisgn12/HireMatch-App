// screens/Profile.tsx

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  ActividadRecienteResponse,
  LogroDestacadoResponse,
  marcarBadgesNotificados,
  obtenerBadgesUsuario,
  obtenerPerfilConEstadisticas,
  obtenerProgresoBadges,
  PerfilConEstadisticasResponse,
  ProgresoResponse,
  updateUserProfile,
  UsuarioBadgeResponse,
  verificarNuevosBadges
} from '../services/api';

const { width } = Dimensions.get('window');

interface ProfileFormData {
  nombre_empresa: string;
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
    tipo_perfil: 'postulante',
    foto: null,
  });
  const [modalFormData, setModalFormData] = useState<ProfileFormData>(formData);
  const [perfilCompleto, setPerfilCompleto] = useState<PerfilConEstadisticasResponse | null>(null);
  const [progresoBadges, setProgresoBadges] = useState<ProgresoResponse[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [badgesModalVisible, setBadgesModalVisible] = useState(false);
  const [estadisticasModalVisible, setEstadisticasModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const perfilConEstadisticas = await obtenerPerfilConEstadisticas();
      // Ensure arrays are not null
      const normalizedPerfil = {
        ...perfilConEstadisticas,
        actividadReciente: perfilConEstadisticas.actividadReciente ?? [],
        logrosDestacados: perfilConEstadisticas.logrosDestacados ?? [],
        badgesRecientes: perfilConEstadisticas.badgesRecientes ?? [],
        badges: perfilConEstadisticas.badges ?? [],
        proximosBadges: perfilConEstadisticas.proximosBadges ?? [],
      };
      setPerfilCompleto(normalizedPerfil);

      const updatedFormData = {
        nombre_empresa: normalizedPerfil.nombreEmpresa || '',
        descripcion: normalizedPerfil.descripcion || '',
        ubicacion: normalizedPerfil.ubicacion || '',
        telefono: normalizedPerfil.telefono || '',
        sitio_web: normalizedPerfil.sitioWeb || '',
        experiencia: normalizedPerfil.experiencia || '',
        habilidades: normalizedPerfil.habilidades || '',
        educacion: normalizedPerfil.educacion || '',
        certificaciones: normalizedPerfil.certificaciones || '',
        intereses: normalizedPerfil.intereses || '',
        tipo_perfil: normalizedPerfil.tipoPerfil as 'postulante' | 'empresa',
        foto: normalizedPerfil.fotoUrl || null,
      };
      setFormData(updatedFormData);
      setModalFormData(updatedFormData);

      const progreso = await obtenerProgresoBadges();
      setProgresoBadges(progreso);

      const badgeResponse = await verificarNuevosBadges();
      if (badgeResponse.mostrarNotificacion && badgeResponse.nuevosBadges.length > 0) {
        Toast.show({
          type: 'success',
          text1: '¡Nuevos Badges!',
          text2: badgeResponse.mensaje || '¡Has desbloqueado nuevos logros!',
        });
        if (badgeResponse.subirNivel) {
          Toast.show({
            type: 'success',
            text1: '¡Subiste de nivel!',
            text2: `Ahora eres nivel ${badgeResponse.nivelNuevo}!`,
          });
        }
      }
    } catch (err) {
      setError((err as Error).message || 'Error al cargar el perfil');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: (err as Error).message || 'Error al cargar el perfil',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setModalFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('token');
              router.replace('/auth/login');
            } catch (error) {
              console.log('Error al cerrar sesión:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No se pudo cerrar sesión.',
              });
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (modalFormData.tipo_perfil === 'empresa' && (!modalFormData.nombre_empresa || modalFormData.nombre_empresa.trim() === '')) {
      setError('El nombre de la empresa es obligatorio');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'El nombre de la empresa es obligatorio',
      });
      return;
    }

    if (JSON.stringify(modalFormData) === JSON.stringify(formData)) {
      setModalVisible(false);
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        nombre_empresa: modalFormData.nombre_empresa,
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

      await updateUserProfile(payload);
      setFormData((prev) => ({ ...prev, ...modalFormData }));
      setModalVisible(false);
      setError('');

      await fetchProfileData();

      Toast.show({
        type: 'success',
        text1: 'Perfil actualizado',
        text2: 'Los cambios se han guardado correctamente.',
      });
    } catch (err) {
      const errorMessage = (err as Error).message || 'Error al actualizar el perfil';
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

  const handleCancel = () => {
    setModalFormData(formData);
    setModalVisible(false);
    setError('');
  };

  const handleCloseBadgesModal = async () => {
    setBadgesModalVisible(false);
    try {
      await marcarBadgesNotificados();
      const updatedBadges = await obtenerBadgesUsuario();
      setPerfilCompleto((prev) =>
        prev ? { ...prev, badges: updatedBadges, badgesRecientes: updatedBadges.filter((b) => b.esNuevo) } : prev
      );
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudieron marcar los badges como notificados.',
      });
    }
  };

  const renderBadgeItem = ({ item }: { item: UsuarioBadgeResponse }) => (
    <View className="bg-white rounded-xl p-4 mr-3 items-center shadow-sm" style={{ width: 120 }}>
      <View className="w-12 h-12 rounded-full items-center justify-center mb-2" style={{ backgroundColor: item.badge.color + '20' }}>
        <Icon name={item.badge.icono} size={24} color={item.badge.color} />
      </View>
      <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-xs text-gray-800 text-center mb-1" numberOfLines={2}>
        {item.badge.descripcion.split(' ').slice(0, 2).join(' ')}
      </Text>
      <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-xs text-gray-500 text-center">
        {new Date(item.fechaObtenido).toLocaleDateString()}
      </Text>
      {item.esNuevo && (
        <View className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center">
          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-xs text-white">!</Text>
        </View>
      )}
    </View>
  );

  const renderProgresoItem = ({ item }: { item: ProgresoResponse }) => (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
      <View className="flex-row items-center mb-2">
        <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: item.color + '20' }}>
          <Icon name={item.icono} size={20} color={item.color} />
        </View>
        <View className="flex-1">
          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-800 text-sm">
            {item.descripcion}
          </Text>
          <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-500 text-xs">
            {item.progresoActual} / {item.progresoRequerido}
          </Text>
        </View>
        <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-primary">
          {Math.round(item.porcentajeCompletado)}%
        </Text>
      </View>
      <View className="bg-gray-200 rounded-full h-2">
        <View className="bg-primary rounded-full h-2" style={{ width: `${Math.min(item.porcentajeCompletado, 100)}%` }} />
      </View>
    </View>
  );

  const renderActividadRecienteItem = ({ item }: { item: ActividadRecienteResponse }) => (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm flex-row items-center">
      <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: item.color + '20' }}>
        <Icon name={item.icono} size={20} color={item.color} />
      </View>
      <View className="flex-1">
        <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-800 text-sm">
          {item.descripcion}
        </Text>
        <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-500 text-xs">
          {item.tiempoTranscurrido}
        </Text>
      </View>
    </View>
  );

  const renderLogroDestacadoItem = ({ item }: { item: LogroDestacadoResponse }) => (
    <View className="bg-white rounded-xl p-4 mr-3 items-center shadow-sm" style={{ width: 120 }}>
      <View className="w-12 h-12 rounded-full items-center justify-center mb-2" style={{ backgroundColor: item.color + '20' }}>
        <Icon name={item.icono} size={24} color={item.color} />
      </View>
      <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-xs text-gray-800 text-center mb-1" numberOfLines={2}>
        {item.titulo}
      </Text>
      <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-xs text-gray-500 text-center">
        {item.valor} {item.categoria.toLowerCase()}
      </Text>
      {item.esReciente && (
        <View className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center">
          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-xs text-white">!</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Icon name="autorenew" size={40} color="#3B82F6" />
        <Text className="text-gray-700 text-lg font-poppins mt-2">Cargando perfil...</Text>
      </View>
    );
  }

  if (!perfilCompleto) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-700 text-lg font-poppins">Error al cargar datos</Text>
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
              <Image source={require('../../assets/images/HireMatch-Logo.png')} className="w-32 h-32" />
              <View className="relative">
                <Image
                  source={formData.foto ? { uri: formData.foto } : require('../../assets/images/default-profile.png')}
                  className="w-28 h-28 rounded-full border-4 border-primary shadow-md mt-4"
                />
                <View className="absolute -bottom-2 -right-2 bg-primary rounded-full w-12 h-12 items-center justify-center border-4 border-white">
                  <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-white text-sm">
                    {perfilCompleto.nivelUsuario}
                  </Text>
                </View>
              </View>
              <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-2xl text-primary mt-4">
                {perfilCompleto.nombreCompleto}
              </Text>
              <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-lg text-gray-600">
                {perfilCompleto.titulo}
              </Text>
              <View className="flex-row mt-3 space-x-4">
                <View className={`px-4 py-1 rounded-full ${formData.tipo_perfil === 'postulante' ? 'bg-blue-100' : 'bg-green-100'}`}>
                  <Text
                    style={{ fontFamily: 'Poppins-SemiBold' }}
                    className={`text-sm capitalize ${formData.tipo_perfil === 'postulante' ? 'text-blue-600' : 'text-green-600'}`}
                  >
                    {formData.tipo_perfil}
                  </Text>
                </View>
                <View className="bg-yellow-100 px-4 py-1 rounded-full">
                  <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-yellow-700 text-sm">
                    {perfilCompleto.estadisticas.totalBadges} Badges
                  </Text>
                </View>
              </View>
              <View className="flex-row mt-4 space-x-3">
                <TouchableOpacity onPress={() => setModalVisible(true)} className="bg-primary rounded-full px-6 py-2">
                  <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-white text-base">
                    Editar Perfil
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setBadgesModalVisible(true)} className="bg-yellow-500 rounded-full px-6 py-2">
                  <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-white text-base">
                    Ver Badges
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Estadísticas Rápidas */}
          <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-lg text-gray-800">
                Estadísticas
              </Text>
              <TouchableOpacity onPress={() => setEstadisticasModalVisible(true)}>
                <Icon name="bar-chart" size={24} color="#3B82F6" />
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap -mx-2">
              <View className="w-1/2 px-2 mb-4">
                <View className="bg-green-50 rounded-lg p-3 items-center">
                  <Icon name="favorite" size={24} color="#10B981" />
                  <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-green-600 text-lg mt-1">
                    {perfilCompleto.estadisticas.totalMatches}
                  </Text>
                  <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-green-600 text-xs text-center">
                    Matches
                  </Text>
                </View>
              </View>
              <View className="w-1/2 px-2 mb-4">
                <View className="bg-blue-50 rounded-lg p-3 items-center">
                  <Icon name="thumb-up" size={24} color="#3B82F6" />
                  <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-blue-600 text-lg mt-1">
                    {perfilCompleto.estadisticas.totalLikesDados}
                  </Text>
                  <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-blue-600 text-xs text-center">
                    Likes Dados
                  </Text>
                </View>
              </View>
              <View className="w-1/2 px-2">
                <View className="bg-purple-50 rounded-lg p-3 items-center">
                  <Icon name="star" size={24} color="#8B5CF6" />
                  <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-purple-600 text-lg mt-1">
                    {perfilCompleto.estadisticas.totalSuperlikesDados}
                  </Text>
                  <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-purple-600 text-xs text-center">
                    SuperLikes
                  </Text>
                </View>
              </View>
              <View className="w-1/2 px-2">
                <View className="bg-orange-50 rounded-lg p-3 items-center">
                  <Icon name="trending-up" size={24} color="#F59E0B" />
                  <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-orange-600 text-lg mt-1">
                    {Math.round(perfilCompleto.estadisticas.tasaExito * 100)}%
                  </Text>
                  <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-orange-600 text-xs text-center">
                    Tasa Éxito
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Logros Destacados */}
          {(perfilCompleto.logrosDestacados?.length ?? 0) > 0 && (
            <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-lg text-gray-800">
                  Logros Destacados
                </Text>
                <TouchableOpacity onPress={() => setBadgesModalVisible(true)}>
                  <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-primary">
                    Ver todos
                  </Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={perfilCompleto.logrosDestacados.slice(0, 3)}
                renderItem={renderLogroDestacadoItem}
                keyExtractor={(item) => item.titulo}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 20 }}
              />
            </View>
          )}

          {/* Badges Recientes */}
          {(perfilCompleto.badgesRecientes?.length ?? 0) > 0 && (
            <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-lg text-gray-800">
                  Badges Recientes
                </Text>
                <TouchableOpacity onPress={() => setBadgesModalVisible(true)}>
                  <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-primary">
                    Ver todos
                  </Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={perfilCompleto.badgesRecientes.slice(0, 3)}
                renderItem={renderBadgeItem}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 20 }}
              />
            </View>
          )}

          {/* Actividad Reciente */}
          {(perfilCompleto.actividadReciente?.length ?? 0) > 0 && (
            <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-lg text-gray-800 mb-4">
                Actividad Reciente
              </Text>
              <FlatList
                data={perfilCompleto.actividadReciente.slice(0, 3)}
                renderItem={renderActividadRecienteItem}
                keyExtractor={(item) => `${item.tipo}-${item.fecha}`}
                scrollEnabled={false}
              />
            </View>
          )}

          {/* Progreso hacia próximos badges */}
          {(progresoBadges?.length ?? 0) > 0 && (
            <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-lg text-gray-800 mb-4">
                Próximos Logros
              </Text>
              <FlatList
                data={progresoBadges.slice(0, 3)}
                renderItem={renderProgresoItem}
                keyExtractor={(item) => item.nombreBadge}
                scrollEnabled={false}
              />
            </View>
          )}

          {/* Información Personal */}
          <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-lg text-gray-800 mb-4">
              Información Personal
            </Text>
            {formData.descripcion && (
              <View className="mb-4">
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 mb-1">
                  Descripción
                </Text>
                <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                  {formData.descripcion}
                </Text>
              </View>
            )}
            {formData.ubicacion && (
              <View className="mb-4">
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 mb-1">
                  Ubicación
                </Text>
                <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                  {formData.ubicacion}
                </Text>
              </View>
            )}
            {formData.habilidades && (
              <View className="mb-4">
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 mb-1">
                  Habilidades
                </Text>
                <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                  {formData.habilidades}
                </Text>
              </View>
            )}
            {formData.intereses && (
              <View className="mb-4">
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 mb-1">
                  Intereses
                </Text>
                <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                  {formData.intereses}
                </Text>
              </View>
            )}
          </View>

          {/* Información de Contacto */}
          {(formData.telefono || formData.sitio_web || perfilCompleto.email) && (
            <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-lg text-gray-800 mb-4">
                Contacto
              </Text>
              <View className="mb-4">
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 mb-1">
                  Email
                </Text>
                <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                  {perfilCompleto.email}
                </Text>
              </View>
              {formData.telefono && (
                <View className="mb-4">
                  <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 mb-1">
                    Teléfono
                  </Text>
                  <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                    {formData.telefono}
                  </Text>
                </View>
              )}
              {formData.sitio_web && (
                <View>
                  <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 mb-1">
                    Sitio Web
                  </Text>
                  <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-blue-600">
                    {formData.sitio_web}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Información Profesional para postulantes */}
          {formData.tipo_perfil === 'postulante' && (formData.experiencia || formData.educacion || formData.certificaciones) && (
            <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-lg text-gray-800 mb-4">
                Información Profesional
              </Text>
              {formData.experiencia && (
                <View className="mb-4">
                  <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 mb-1">
                    Experiencia
                  </Text>
                  <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                    {formData.experiencia}
                  </Text>
                </View>
              )}
              {formData.educacion && (
                <View className="mb-4">
                  <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 mb-1">
                    Educación
                  </Text>
                  <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                    {formData.educacion}
                  </Text>
                </View>
              )}
              {formData.certificaciones && (
                <View>
                  <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 mb-1">
                    Certificaciones
                  </Text>
                  <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                    {formData.certificaciones}
                  </Text>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity onPress={handleLogout} className="mt-4 bg-red-500 rounded-full px-6 py-2 mb-8">
            <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-white text-base text-center">
              Cerrar sesión
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de Badges */}
      <Modal animationType="slide" transparent={true} visible={badgesModalVisible} onRequestClose={handleCloseBadgesModal}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl p-6 w-11/12 max-w-md h-4/5">
            <View className="flex-row justify-between items-center mb-4">
              <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-xl text-primary">
                Mis Badges
              </Text>
              <TouchableOpacity onPress={handleCloseBadgesModal}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <View className="flex-row flex-wrap -mx-2">
                {perfilCompleto.badges?.map((badge) => (
                  <View key={badge.id} className="w-1/2 px-2 mb-4">
                    <View className="bg-gray-50 rounded-xl p-4 items-center">
                      <View className="w-12 h-12 rounded-full items-center justify-center mb-2" style={{ backgroundColor: badge.badge.color + '20' }}>
                        <Icon name={badge.badge.icono} size={24} color={badge.badge.color} />
                      </View>
                      <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-xs text-gray-800 text-center mb-1" numberOfLines={2}>
                        {badge.badge.descripcion}
                      </Text>
                      <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-xs text-gray-500 text-center">
                        {new Date(badge.fechaObtenido).toLocaleDateString()}
                      </Text>
                      {badge.esNuevo && (
                        <View className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center">
                          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-xs text-white">¡Nuevo!</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
              {(perfilCompleto.badges?.length ?? 0) === 0 && (
                <View className="items-center py-8">
                  <Icon name="emoji-events" size={48} color="#D1D5DB" />
                  <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-500 text-center mt-4">
                    Aún no tienes badges.
                  </Text>
                  <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-center text-sm">
                    ¡Sigue usando la app para desbloquear logros!
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Estadísticas Detalladas */}
      <Modal animationType="slide" transparent={true} visible={estadisticasModalVisible} onRequestClose={() => setEstadisticasModalVisible(false)}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl p-6 w-11/12 max-w-md h-4/5">
            <View className="flex-row justify-between items-center mb-4">
              <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-xl text-primary">
                Estadísticas Detalladas
              </Text>
              <TouchableOpacity onPress={() => setEstadisticasModalVisible(false)}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <View className="mb-6">
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-800 mb-3">
                  Actividad General
                </Text>
                <View className="bg-gray-50 rounded-lg p-4">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                      Matches Totales
                    </Text>
                    <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-800">
                      {perfilCompleto.estadisticas.totalMatches}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center mb-2">
                    <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                      Likes Dados
                    </Text>
                    <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-800">
                      {perfilCompleto.estadisticas.totalLikesDados}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center mb-2">
                    <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                      Likes Recibidos
                    </Text>
                    <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-800">
                      {perfilCompleto.estadisticas.totalLikesRecibidos}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                      SuperLikes Dados
                    </Text>
                    <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-800">
                      {perfilCompleto.estadisticas.totalSuperlikesDados}
                    </Text>
                  </View>
                </View>
              </View>
              <View className="mb-6">
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-800 mb-3">
                  Métricas de Rendimiento
                </Text>
                <View className="bg-gray-50 rounded-lg p-4">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                      Tasa de Éxito
                    </Text>
                    <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-green-600">
                      {Math.round(perfilCompleto.estadisticas.tasaExito * 100)}%
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center mb-2">
                    <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                      Popularidad
                    </Text>
                    <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-blue-600">
                      {Math.round(perfilCompleto.estadisticas.popularidad * 100)}%
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center mb-2">
                    <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                      Tasa de Respuesta
                    </Text>
                    <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-blue-600">
                      {Math.round(perfilCompleto.estadisticas.tasaRespuesta * 100)}%
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center mb-2">
                    <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                      Rendimiento vs Promedio
                    </Text>
                    <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-purple-600">
                      {perfilCompleto.estadisticas.rendimientoVsPromedio}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center mb-2">
                    <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                      Posición en Ranking
                    </Text>
                    <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-orange-600">
                      {Math.round(perfilCompleto.estadisticas.posicionRanking)}%
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                      Total Badges
                    </Text>
                    <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-yellow-600">
                      {perfilCompleto.estadisticas.totalBadges}
                    </Text>
                  </View>
                </View>
              </View>
              <View>
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-800 mb-3">
                  Información de Cuenta
                </Text>
                <View className="bg-gray-50 rounded-lg p-4">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                      Miembro desde
                    </Text>
                    <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-800">
                      {new Date(perfilCompleto.estadisticas.fechaRegistro).toLocaleDateString()}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center mb-2">
                    <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                      Última Actividad
                    </Text>
                    <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-800">
                      {perfilCompleto.estadisticas.ultimaActividad ? new Date(perfilCompleto.estadisticas.ultimaActividad).toLocaleDateString() : 'N/A'}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">
                      Nivel de Usuario
                    </Text>
                    <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-primary">
                      Nivel {perfilCompleto.nivelUsuario}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal para Editar Perfil */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={handleCancel}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl p-6 w-11/12 max-w-md h-5/6">
            <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-xl text-primary mb-4">
              Editar Perfil
            </Text>
            <ScrollView>
              {modalFormData.tipo_perfil === 'empresa' && (
                <View className="mb-4">
                  <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 text-sm mb-1">
                    Nombre de la Empresa
                  </Text>
                  <TextInput
                    style={{ fontFamily: 'Poppins-Regular' }}
                    className="border border-gray-300 rounded-lg p-2 text-gray-600"
                    value={modalFormData.nombre_empresa}
                    onChangeText={(text) => handleInputChange('nombre_empresa', text.slice(0, 150))}
                  />
                </View>
              )}
              <View className="mb-4">
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 text-sm mb-1">
                  Descripción
                </Text>
                <TextInput
                  style={{ fontFamily: 'Poppins-Regular' }}
                  className="border border-gray-300 rounded-lg p-2 text-gray-600"
                  value={modalFormData.descripcion}
                  onChangeText={(text) => handleInputChange('descripcion', text.slice(0, 1000))}
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
                  onChangeText={(text) => handleInputChange('ubicacion', text.slice(0, 255))}
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
                  onChangeText={(text) => handleInputChange('telefono', text.slice(0, 20))}
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
                  onChangeText={(text) => handleInputChange('sitio_web', text.slice(0, 255))}
                  keyboardType="url"
                />
              </View>
              {modalFormData.tipo_perfil === 'postulante' && (
                <>
                  <View className="mb-4">
                    <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 text-sm mb-1">
                      Experiencia
                    </Text>
                    <TextInput
                      style={{ fontFamily: 'Poppins-Regular' }}
                      className="border border-gray-300 rounded-lg p-2 text-gray-600"
                      value={modalFormData.experiencia}
                      onChangeText={(text) => handleInputChange('experiencia', text.slice(0, 2000))}
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
                      onChangeText={(text) => handleInputChange('educacion', text.slice(0, 2000))}
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
                      onChangeText={(text) => handleInputChange('certificaciones', text.slice(0, 2000))}
                      multiline
                    />
                  </View>
                </>
              )}
              <View className="mb-4">
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 text-sm mb-1">
                  Habilidades
                </Text>
                <TextInput
                  style={{ fontFamily: 'Poppins-Regular' }}
                  className="border border-gray-300 rounded-lg p-2 text-gray-600"
                  value={modalFormData.habilidades}
                  onChangeText={(text) => handleInputChange('habilidades', text.slice(0, 500))}
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
                  onChangeText={(text) => handleInputChange('intereses', text.slice(0, 500))}
                  multiline
                />
              </View>
            </ScrollView>
            {error ? <Text className="text-red-500 text-center mb-4">{error}</Text> : null}
            <View className="flex-row justify-between mt-4">
              <TouchableOpacity onPress={handleCancel} className="bg-gray-200 rounded-full px-6 py-2">
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-700 text-base">
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={isSaving}
                className={`bg-primary rounded-full px-6 py-2 ${isSaving ? 'opacity-50' : ''}`}
              >
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-white text-base">
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