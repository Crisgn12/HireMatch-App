import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { createJobOffer, getCompanyId, getJobOfferDetails, getJobOffersByCompany, updateJobOffer } from '../services/api';

// Interfaz para los datos del formulario
interface JobOfferFormData {
  id?: number;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  tipoTrabajo: 'REMOTO' | 'PRESENCIAL' | 'HIBRIDO';
  tipoContrato: 'TIEMPO_COMPLETO' | 'MEDIO_TIEMPO' | 'CONTRATO' | 'TEMPORAL' | 'FREELANCE' | 'PRACTICAS';
  nivelExperiencia: 'ESTUDIANTE' | 'JUNIOR' | 'SEMI_SENIOR' | 'SENIOR' | 'LEAD' | 'DIRECTOR';
  areaTrabajo: string;
  salarioMinimo: number;
  salarioMaximo: number;
  moneda: 'USD' | 'CRC' | 'EUR' | 'MXN' | 'CAD';
  aplicacionRapida?: boolean;
  permiteAplicacionExterna?: boolean;
}

// Interfaz para los datos de una oferta laboral
interface JobOffer {
  id: number;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  empresaNombre: string;
  tipoTrabajo: string;
  tipoContrato: string;
  nivelExperiencia: string;
  salarioFormateado: string;
  tiempoPublicacion: string;
  areaTrabajo: string;
  salarioMinimo: number;
  salarioMaximo: number;
  moneda: string;
  aplicacionRapida?: boolean;
  permiteAplicacionExterna?: boolean;
}

const JobOfferComponent = ({ job }: { job: JobOffer }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/companyExtraViews/${job.id}`)}
      className="bg-white rounded-lg p-4 mb-4 shadow-md border border-gray-200"
    >
      <Text className="text-lg font-poppins-semibold text-gray-800">{job.titulo}</Text>
      <Text className="text-sm text-gray-600 mt-1">{job.empresaNombre}</Text>
      <View className="flex-row flex-wrap mt-2">
        <Text className="text-sm text-gray-500 mr-2">{job.ubicacion}</Text>
        <Text className="text-sm text-gray-500 mr-2">• {job.tipoTrabajo}</Text>
        <Text className="text-sm text-gray-500 mr-2">• {job.tipoContrato}</Text>
        <Text className="text-sm text-gray-500">• {job.nivelExperiencia}</Text>
      </View>
      <Text className="text-sm text-gray-700 mt-2">{job.salarioFormateado}</Text>
      <Text className="text-xs text-gray-400 mt-1">{job.tiempoPublicacion}</Text>
    </TouchableOpacity>
  );
};

// Funciones de mapeo desde enum a display
const mapTipoTrabajoToDisplay = (value: string): string => {
  switch (value) {
    case 'REMOTO': return 'Remoto';
    case 'PRESENCIAL': return 'Presencial';
    case 'HIBRIDO': return 'Híbrido';
    default: return value;
  }
};

const mapTipoContratoToDisplay = (value: string): string => {
  switch (value) {
    case 'TIEMPO_COMPLETO': return 'Tiempo Completo';
    case 'MEDIO_TIEMPO': return 'Medio Tiempo';
    case 'CONTRATO': return 'Por Contrato';
    case 'TEMPORAL': return 'Temporal';
    case 'FREELANCE': return 'Freelance';
    case 'PRACTICAS': return 'Prácticas';
    default: return value;
  }
};

const mapNivelExperienciaToDisplay = (value: string): string => {
  switch (value) {
    case 'ESTUDIANTE': return 'Estudiante/Sin experiencia';
    case 'JUNIOR': return 'Junior (0-2 años)';
    case 'SEMI_SENIOR': return 'Semi Senior (2-4 años)';
    case 'SENIOR': return 'Senior (4-7 años)';
    case 'LEAD': return 'Lead/Team Lead (7+ años)';
    case 'DIRECTOR': return 'Director/Manager (10+ años)';
    default: return value;
  }
};

const mapMonedaToDisplay = (value: string): string => {
  switch (value) {
    case 'USD': return 'Dólares ($)';
    case 'CRC': return 'Colones (₡)';
    case 'EUR': return 'Euros (€)';
    case 'MXN': return 'Pesos Mexicanos ($)';
    case 'CAD': return 'Dólares Canadienses (C$)';
    default: return value;
  }
};

// Mapeo de valores de visualización a valores de backend
const mapTipoTrabajoToEnum = (value: string | undefined | null): 'REMOTO' | 'PRESENCIAL' | 'HIBRIDO' => {
  if (!value) return 'REMOTO';
  switch (value.toLowerCase()) {
    case 'remoto':
      return 'REMOTO';
    case 'presencial':
      return 'PRESENCIAL';
    case 'híbrido':
    case 'hibrido':
      return 'HIBRIDO';
    default:
      console.warn(`Unknown tipoTrabajo value: ${value}, defaulting to REMOTO`);
      return 'REMOTO';
  }
};

const mapTipoContratoToEnum = (value: string | undefined | null): 'TIEMPO_COMPLETO' | 'MEDIO_TIEMPO' | 'CONTRATO' | 'TEMPORAL' | 'FREELANCE' | 'PRACTICAS' => {
  if (!value) return 'TIEMPO_COMPLETO';
  switch (value.toLowerCase()) {
    case 'tiempo completo':
    case 'tiempo_completo':
      return 'TIEMPO_COMPLETO';
    case 'medio tiempo':
    case 'medio_tiempo':
      return 'MEDIO_TIEMPO';
    case 'contrato':
    case 'por contrato':
      return 'CONTRATO';
    case 'temporal':
      return 'TEMPORAL';
    case 'freelance':
      return 'FREELANCE';
    case 'prácticas':
    case 'practicas':
      return 'PRACTICAS';
    default:
      console.warn(`Unknown tipoContrato value: ${value}, defaulting to TIEMPO_COMPLETO`);
      return 'TIEMPO_COMPLETO';
  }
};

const mapNivelExperienciaToEnum = (value: string | undefined | null): 'ESTUDIANTE' | 'JUNIOR' | 'SEMI_SENIOR' | 'SENIOR' | 'LEAD' | 'DIRECTOR' => {
  if (!value) return 'ESTUDIANTE';
  switch (value.toLowerCase()) {
    case 'estudiante':
    case 'estudiante/sin experiencia':
      return 'ESTUDIANTE';
    case 'junior':
    case 'junior (0-2 años)':
      return 'JUNIOR';
    case 'semi senior':
    case 'semi senior (2-4 años)':
    case 'semi_senior':
      return 'SEMI_SENIOR';
    case 'senior':
    case 'senior (4-7 años)':
      return 'SENIOR';
    case 'lead':
    case 'lead/team lead (7+ años)':
      return 'LEAD';
    case 'director':
    case 'director/manager (10+ años)':
      return 'DIRECTOR';
    default:
      console.warn(`Unknown nivelExperiencia value: ${value}, defaulting to ESTUDIANTE`);
      return 'ESTUDIANTE';
  }
};

const mapMonedaToEnum = (value: string | undefined | null): 'USD' | 'CRC' | 'EUR' | 'MXN' | 'CAD' => {
  if (!value) return 'USD';
  switch (value.toLowerCase()) {
    case 'usd':
    case 'dólares ($)':
    case 'dolares':
      return 'USD';
    case 'crc':
    case 'colones (₡)':
      return 'CRC';
    case 'eur':
    case 'euros (€)':
      return 'EUR';
    case 'mxn':
    case 'pesos mexicanos ($)':
      return 'MXN';
    case 'cad':
    case 'dólares canadienses (c$)':
    case 'dolares canadienses':
      return 'CAD';
    default:
      console.warn(`Unknown moneda value: ${value}, defaulting to USD`);
      return 'USD';
  }
};

// Función para extraer la moneda desde salarioFormateado
const extractMonedaFromFormateado = (salarioFormateado: string): 'USD' | 'CRC' | 'EUR' | 'MXN' | 'CAD' => {
  if (!salarioFormateado) return 'USD';
  
  // Buscar el símbolo de moneda en el texto
  if (salarioFormateado.includes('₡')) return 'CRC';
  if (salarioFormateado.includes('€')) return 'EUR';
  if (salarioFormateado.includes('C$')) return 'CAD';
  if (salarioFormateado.includes('$') && !salarioFormateado.includes('C$')) {
    // Podría ser USD o MXN
    // Si contiene texto en español, probablemente es MXN
    if (salarioFormateado.toLowerCase().includes('peso') || 
        salarioFormateado.toLowerCase().includes('mx')) {
      return 'MXN';
    }
    return 'USD';
  }
  
  return 'USD'; // Por defecto
};

// Función mejorada para extraer moneda desde monedaSimbolo también
const extractMonedaFromSimbolo = (monedaSimbolo: string): 'USD' | 'CRC' | 'EUR' | 'MXN' | 'CAD' => {
  if (!monedaSimbolo) return 'USD';
  
  switch (monedaSimbolo) {
    case '₡': return 'CRC';
    case '€': return 'EUR';
    case 'C$': return 'CAD';
    case '$': return 'USD'; // Por defecto USD para $
    default: return 'USD';
  }
};

const JobOffers = () => {
  const router = useRouter();
  const { editOfferId } = useLocalSearchParams() as { editOfferId?: string };
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<number | null>(null);
  const [formData, setFormData] = useState<JobOfferFormData>({
    id: undefined,
    titulo: '',
    descripcion: '',
    ubicacion: '',
    tipoTrabajo: 'REMOTO',
    tipoContrato: 'TIEMPO_COMPLETO',
    nivelExperiencia: 'ESTUDIANTE',
    areaTrabajo: '',
    salarioMinimo: 0,
    salarioMaximo: 0,
    moneda: 'USD',
    aplicacionRapida: true,
    permiteAplicacionExterna: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobOffers();
  }, []);

  useEffect(() => {
    if (editOfferId) {
      const jobId = parseInt(editOfferId, 10);
      if (!isNaN(jobId)) {
        fetchJobOfferForEdit(jobId);
      }
    }
  }, [editOfferId]);

  const fetchJobOffers = async () => {
    try {
      const companyId = await getCompanyId();
      const response = await getJobOffersByCompany(companyId);
      console.log('Raw job offers response:', JSON.stringify(response, null, 2));
      const offers = response.content.map((offer: any) => {
        // Parsear salarios desde salarioFormateado si están en 0
        let salarioMin = Number(offer.salarioMinimo) || 0;
        let salarioMax = Number(offer.salarioMaximo) || 0;
        
        // Si los salarios son 0 pero hay salarioFormateado, intentar parsearlo
        if ((salarioMin === 0 || salarioMax === 0) && offer.salarioFormateado) {
          const salarios = offer.salarioFormateado.match(/\d+/g);
          if (salarios && salarios.length >= 2) {
            salarioMin = parseInt(salarios[0]) || 0;
            salarioMax = parseInt(salarios[1]) || 0;
          }
        }

        // Determinar la moneda: prioridad moneda > monedaSimbolo > salarioFormateado
        let moneda = offer.moneda;
        if (!moneda && offer.monedaSimbolo) {
          moneda = extractMonedaFromSimbolo(offer.monedaSimbolo);
        }
        if (!moneda && offer.salarioFormateado) {
          moneda = extractMonedaFromFormateado(offer.salarioFormateado);
        }

        return {
          id: offer.id,
          titulo: offer.titulo || '',
          descripcion: offer.descripcion || '',
          ubicacion: offer.ubicacion || '',
          empresaNombre: offer.empresaNombre || '',
          tipoTrabajo: offer.tipoTrabajo || 'REMOTO',
          tipoContrato: offer.tipoContrato || 'TIEMPO_COMPLETO',
          nivelExperiencia: offer.nivelExperiencia || 'ESTUDIANTE',
          salarioFormateado: offer.salarioFormateado || '',
          tiempoPublicacion: offer.tiempoPublicacion || '',
          areaTrabajo: offer.areaTrabajo || '',
          salarioMinimo: salarioMin,
          salarioMaximo: salarioMax,
          moneda: moneda || 'USD',
          aplicacionRapida: offer.aplicacionRapida ?? true,
          permiteAplicacionExterna: offer.permiteAplicacionExterna ?? false,
        };
      });
      setJobOffers(offers);
    } catch (err) {
      setError((err as Error).message || 'Error al cargar las ofertas');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobOfferForEdit = async (jobId: number) => {
    try {
      const response = await getJobOfferDetails(jobId);
      console.log('Raw job offer details response:', JSON.stringify(response, null, 2));
      
      // Parsear salarios desde salarioFormateado si están en 0
      let salarioMin = Number(response.salarioMinimo) || 0;
      let salarioMax = Number(response.salarioMaximo) || 0;
      
      // Si los salarios son 0 pero hay salarioFormateado, intentar parsearlo
      if ((salarioMin === 0 || salarioMax === 0) && response.salarioFormateado) {
        const salarios = response.salarioFormateado.match(/\d+/g);
        if (salarios && salarios.length >= 2) {
          salarioMin = parseInt(salarios[0]) || 0;
          salarioMax = parseInt(salarios[1]) || 0;
        }
      }

      // Determinar la moneda: prioridad moneda > monedaSimbolo > salarioFormateado
      let moneda = response.moneda;
      if (!moneda && response.monedaSimbolo) {
        moneda = extractMonedaFromSimbolo(response.monedaSimbolo);
      }
      if (!moneda && response.salarioFormateado) {
        moneda = extractMonedaFromFormateado(response.salarioFormateado);
      }

      setFormData({
        id: response.id,
        titulo: response.titulo || '',
        descripcion: response.descripcion || '',
        ubicacion: response.ubicacion || '',
        tipoTrabajo: mapTipoTrabajoToEnum(response.tipoTrabajo),
        tipoContrato: mapTipoContratoToEnum(response.tipoContrato),
        nivelExperiencia: mapNivelExperienciaToEnum(response.nivelExperiencia),
        areaTrabajo: response.areaTrabajo || '',
        salarioMinimo: salarioMin,
        salarioMaximo: salarioMax,
        moneda: mapMonedaToEnum(moneda),
        aplicacionRapida: response.aplicacionRapida ?? true,
        permiteAplicacionExterna: response.permiteAplicacionExterna ?? false,
      });
      setIsEditing(true);
      setEditingOfferId(jobId);
      setModalVisible(true);
    } catch (err) {
      setError((err as Error).message || 'Error al cargar los detalles de la oferta para edición');
      Alert.alert('Error', (err as Error).message || 'Error al cargar los detalles de la oferta para edición');
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingOfferId(null);
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (offer: JobOffer) => {
    console.log('Opening edit modal with offer:', JSON.stringify(offer, null, 2));
    setIsEditing(true);
    setEditingOfferId(offer.id);
    setFormData({
      id: offer.id,
      titulo: offer.titulo || '',
      descripcion: offer.descripcion || '',
      ubicacion: offer.ubicacion || '',
      tipoTrabajo: mapTipoTrabajoToEnum(offer.tipoTrabajo),
      tipoContrato: mapTipoContratoToEnum(offer.tipoContrato),
      nivelExperiencia: mapNivelExperienciaToEnum(offer.nivelExperiencia),
      areaTrabajo: offer.areaTrabajo || '',
      salarioMinimo: Number(offer.salarioMinimo) || 0,
      salarioMaximo: Number(offer.salarioMaximo) || 0,
      moneda: mapMonedaToEnum(offer.moneda),
      aplicacionRapida: offer.aplicacionRapida ?? true,
      permiteAplicacionExterna: offer.permiteAplicacionExterna ?? false,
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setIsEditing(false);
    setEditingOfferId(null);
    resetForm();
    setError(null);
    router.setParams({ editOfferId: undefined });
  };

  const resetForm = () => {
    setFormData({
      id: undefined,
      titulo: '',
      descripcion: '',
      ubicacion: '',
      tipoTrabajo: 'REMOTO',
      tipoContrato: 'TIEMPO_COMPLETO',
      nivelExperiencia: 'ESTUDIANTE',
      areaTrabajo: '',
      salarioMinimo: 0,
      salarioMaximo: 0,
      moneda: 'USD',
      aplicacionRapida: true,
      permiteAplicacionExterna: false,
    });
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.titulo || formData.titulo.trim() === '') {
        throw new Error('El título es obligatorio');
      }
      if (!formData.descripcion || formData.descripcion.trim() === '') {
        throw new Error('La descripción es obligatoria');
      }
      if (!formData.ubicacion || formData.ubicacion.trim() === '') {
        throw new Error('La ubicación es obligatoria');
      }
      if (!formData.areaTrabajo || formData.areaTrabajo.trim() === '') {
        throw new Error('El área de trabajo es obligatoria');
      }
      if (!formData.tipoContrato) {
        throw new Error('El tipo de contrato es obligatorio');
      }
      if (formData.salarioMinimo < 0 || formData.salarioMaximo < 0) {
        throw new Error('Los salarios no pueden ser negativos');
      }
      if (formData.salarioMaximo < formData.salarioMinimo) {
        throw new Error('El salario máximo debe ser mayor o igual al salario mínimo');
      }
      if (!formData.moneda) {
        throw new Error('La moneda es obligatoria');
      }

      console.log('Submitting form data:', JSON.stringify(formData, null, 2));

      // Crear payload con solo los campos necesarios
      const payload = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        ubicacion: formData.ubicacion,
        tipoTrabajo: formData.tipoTrabajo,
        tipoContrato: formData.tipoContrato,
        nivelExperiencia: formData.nivelExperiencia,
        areaTrabajo: formData.areaTrabajo,
        salarioMinimo: formData.salarioMinimo,
        salarioMaximo: formData.salarioMaximo,
        moneda: formData.moneda,
        aplicacionRapida: formData.aplicacionRapida,
        permiteAplicacionExterna: formData.permiteAplicacionExterna,
        // Campos requeridos por el backend con valores vacíos
        beneficios: '',
        requisitos: '',
        habilidadesRequeridas: '',
        idiomas: '',
        preguntasAdicionales: '',
        urlAplicacionExterna: '',
      };

      if (isEditing && editingOfferId) {
        await updateJobOffer(editingOfferId, payload);
        Alert.alert(
          'Éxito',
          'Oferta actualizada correctamente',
          [{ text: 'OK', onPress: () => closeModal() }],
          { cancelable: false }
        );
      } else {
        await createJobOffer(payload);
        Alert.alert(
          'Éxito',
          'Oferta creada correctamente',
          [{ text: 'OK', onPress: () => closeModal() }],
          { cancelable: false }
        );
      }
      
      await fetchJobOffers();
    } catch (err) {
      const errorMessage = (err as Error).message || `Error al ${isEditing ? 'actualizar' : 'crear'} la oferta`;
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
          onPress={openCreateModal}
          className="mt-4 bg-primary rounded-full px-6 py-2 shadow-md flex-row items-center justify-center mb-10"
        >
          <Icon name="add" size={25} color="white" />
          <Text className="text-white font-poppins-semibold text-base">Nueva Oferta</Text>
        </TouchableOpacity>

        {jobOffers.length > 0 ? (
          jobOffers.map((job) => (
            <View key={job.id} className="mb-4">
              <JobOfferComponent job={job} />
            </View>
          ))
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
                {isEditing ? 'Editar Oferta' : 'Crear Nueva Oferta'}
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
                      onValueChange={(itemValue: any) => setFormData({ ...formData, tipoTrabajo: itemValue })}
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
                    Tipo de Contrato
                  </Text>
                  <View className="border border-gray-300 rounded-lg p-2 bg-white">
                    <Picker
                      selectedValue={formData.tipoContrato}
                      onValueChange={(itemValue: any) => setFormData({ ...formData, tipoContrato: itemValue })}
                      style={{ fontFamily: 'Poppins-Regular', color: '#4B5563' }}
                    >
                      <Picker.Item label="Tiempo Completo" value="TIEMPO_COMPLETO" />
                      <Picker.Item label="Medio Tiempo" value="MEDIO_TIEMPO" />
                      <Picker.Item label="Por Contrato" value="CONTRATO" />
                      <Picker.Item label="Temporal" value="TEMPORAL" />
                      <Picker.Item label="Freelance" value="FREELANCE" />
                      <Picker.Item label="Prácticas" value="PRACTICAS" />
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
                      onValueChange={(itemValue: any) => setFormData({ ...formData, nivelExperiencia: itemValue })}
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
                      onValueChange={(itemValue: any) => setFormData({ ...formData, moneda: itemValue })}
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
                    {isEditing ? 'Actualizar' : 'Crear'}
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