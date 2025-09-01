import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.100.101:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for JWT token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      console.error('API Error:', status, data); // Log for debugging
      if (status === 400) {
        return Promise.reject(new Error(data.message || 'Error de validación'));
      } else if (status === 401) {
        return Promise.reject(new Error('No autorizado'));
      } else if (status === 500) {
        return Promise.reject(new Error('Error en el servidor'));
      }
    } else if (error.request) {
      return Promise.reject(new Error('No se recibió respuesta del servidor'));
    } else {
      return Promise.reject(new Error('Error de conexión'));
    }
  }
);

// Client-side validation helpers
const isValidPhone = (phone: string) => /^[+\d\s\-()]+$/.test(phone) && phone.replace(/[^\d]/g, '').length >= 7;
const isValidUrl = (url: string) => /^(https?:\/\/)?(www\.)?[a-zA-Z0-9\-\.]+.[a-zA-Z]{2,}(\/.*)?$/.test(url);

export const registerUser = async (data: { nombre: string; apellido: string; email: string; password: string }) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const verifyCode = async (data: { email: string; code: string }) => {
  const response = await api.post('/auth/verify-email', {
    email: data.email,
    codigo: data.code,
  });
  return response.data;
};

export const resendCode = async (data: { email: string }) => {
  const response = await api.post('/auth/resend-code', data);
  return response.data;
};

export const loginUser = async (data: { email: string; password: string }) => {
  const response = await api.post('/auth/login', data);
  if (response.data.token) {
    await AsyncStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get('/api/perfiles/me');
  return response.data; // Returns ProfileResponse with nombreEmpresa, fotoUrl
};

export const updateProfile = async (data: {
  nombre_empresa?: string;
  descripcion?: string;
  ubicacion?: string;
  telefono?: string;
  sitio_web?: string;
  experiencia?: string;
  habilidades?: string;
  educacion?: string;
  certificaciones?: string;
  intereses?: string;
}) => {
  // Validate optional fields
  if (data.nombre_empresa && data.nombre_empresa.length > 150) {
    throw new Error('El nombre de la empresa no puede exceder los 150 caracteres');
  }
  if (data.telefono && !isValidPhone(data.telefono)) {
    throw new Error('El formato del teléfono no es válido');
  }
  if (data.sitio_web && !isValidUrl(data.sitio_web)) {
    throw new Error('El formato de la URL no es válido');
  }
  const response = await api.put('/api/perfiles/me', {
    nombreEmpresa: data.nombre_empresa,
    descripcion: data.descripcion,
    ubicacion: data.ubicacion,
    telefono: data.telefono,
    sitioWeb: data.sitio_web,
    experiencia: data.experiencia,
    habilidades: data.habilidades,
    educacion: data.educacion,
    certificaciones: data.certificaciones,
    intereses: data.intereses,
  });
  return response.data;
};

export const createProfile = async (data: {
  tipo_perfil: 'postulante' | 'empresa';
  nombre_empresa?: string;
  descripcion?: string;
  ubicacion?: string;
  habilidades?: string;
  telefono?: string;
  sitio_web?: string;
  experiencia?: string;
  educacion?: string;
  certificaciones?: string;
  intereses?: string;
}) => {
  // Validate required fields
  if (!['postulante', 'empresa'].includes(data.tipo_perfil)) {
    throw new Error('Tipo de perfil debe ser "postulante" o "empresa"');
  }
  if (data.tipo_perfil === 'empresa' && (!data.nombre_empresa || data.nombre_empresa.trim() === '')) {
    throw new Error('El nombre de la empresa es obligatorio para perfiles de tipo empresa');
  }
  // Validate optional fields
  if (data.nombre_empresa && data.nombre_empresa.length > 150) {
    throw new Error('El nombre de la empresa no puede exceder los 150 caracteres');
  }
  if (data.descripcion && data.descripcion.length > 1000) {
    throw new Error('La descripción no puede exceder los 1000 caracteres');
  }
  if (data.ubicacion && data.ubicacion.length > 255) {
    throw new Error('La ubicación no puede exceder los 255 caracteres');
  }
  if (data.habilidades && data.habilidades.length > 500) {
    throw new Error('Las habilidades no pueden exceder los 500 caracteres');
  }
  if (data.telefono && !isValidPhone(data.telefono)) {
    throw new Error('El formato del teléfono no es válido');
  }
  if (data.sitio_web && !isValidUrl(data.sitio_web)) {
    throw new Error('El formato de la URL no es válido');
  }
  if (data.experiencia && data.experiencia.length > 2000) {
    throw new Error('La experiencia no puede exceder los 2000 caracteres');
  }
  if (data.educacion && data.educacion.length > 2000) {
    throw new Error('La educación no puede exceder los 2000 caracteres');
  }
  if (data.certificaciones && data.certificaciones.length > 2000) {
    throw new Error('Las certificaciones no pueden exceder los 2000 caracteres');
  }
  if (data.intereses && data.intereses.length > 500) {
    throw new Error('Los intereses no pueden exceder los 500 caracteres');
  }

  const response = await api.post('/api/perfiles', {
    tipoPerfil: data.tipo_perfil,
    nombreEmpresa: data.nombre_empresa,
    descripcion: data.descripcion,
    ubicacion: data.ubicacion,
    habilidades: data.habilidades,
    telefono: data.telefono,
    sitioWeb: data.sitio_web,
    experiencia: data.experiencia,
    educacion: data.educacion,
    certificaciones: data.certificaciones,
    intereses: data.intereses,
  });
  return response.data;
};

export const uploadProfilePhoto = async (perfil_id: number, photo: FormData) => {
  const response = await api.post(`/api/perfiles/${perfil_id}/foto`, photo, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateUserActivo = async () => {
  const response = await api.patch('/api/usuarios/activo');
  return response.data;
};

// Interfaz para los datos del perfil que se envían al endpoint
interface UpdateProfilePayload {
  nombre_empresa?: string;
  descripcion: string;
  ubicacion: string;
  telefono: string;
  sitioWeb: string;
  experiencia: string;
  habilidades: string;
  educacion: string;
  certificaciones: string;
  intereses: string;
}

export const updateUserProfile = async (data: UpdateProfilePayload) => {
  try {
    const response = await api.put('/api/perfiles/me', {
      nombreEmpresa: data.nombre_empresa,
      descripcion: data.descripcion,
      ubicacion: data.ubicacion,
      sitioWeb: data.sitioWeb,
      experiencia: data.experiencia,
      habilidades: data.habilidades,
      educacion: data.educacion,
      certificaciones: data.certificaciones,
      intereses: data.intereses,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Perfil actualizado:', response.data);
    return response.data;
  } catch (error) {
    throw new Error('Error al actualizar el perfil: ' + (error as Error).message);
  }
};


// Interfaz para los datos de la oferta de trabajo que se envían al endpoint /ofertas
interface CreateJobOfferPayload {
  titulo: string;
  descripcion: string;
  ubicacion: string;
  tipoTrabajo: string;
  tipoContrato: string;
  nivelExperiencia: string;
  areaTrabajo: string;
  salarioMinimo: number;
  salarioMaximo: number;
  moneda: string;
  beneficios?: string;
  requisitos?: string;
  habilidadesRequeridas?: string;
  idiomas?: string;
  aplicacionRapida?: boolean;
  preguntasAdicionales?: string;
  permiteAplicacionExterna?: boolean;
  urlAplicacionExterna?: string;
}

export const createJobOffer = async (data: CreateJobOfferPayload) => {
  try {
    const response = await api.post('/ofertas', {
      titulo: data.titulo,
      descripcion: data.descripcion,
      ubicacion: data.ubicacion,
      tipoTrabajo: data.tipoTrabajo,
      tipoContrato: data.tipoContrato,
      nivelExperiencia: data.nivelExperiencia,
      areaTrabajo: data.areaTrabajo,
      salarioMinimo: data.salarioMinimo,
      salarioMaximo: data.salarioMaximo,
      moneda: data.moneda,
      beneficios: data.beneficios,
      requisitos: data.requisitos,
      habilidadesRequeridas: data.habilidadesRequeridas,
      idiomas: data.idiomas,
      aplicacionRapida: data.aplicacionRapida,
      preguntasAdicionales: data.preguntasAdicionales,
      permiteAplicacionExterna: data.permiteAplicacionExterna,
      urlAplicacionExterna: data.urlAplicacionExterna,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Oferta creada:', response.data);
    return response.data;
  } catch (error) {
    throw new Error('Error al crear la oferta: ' + (error as Error).message);
  }
};

export default api;