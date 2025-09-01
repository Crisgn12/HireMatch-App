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
  const response = await api.get('/api/profile/me');
  return response.data; // Returns ProfileResponse with fotoUrl
};

export const updateProfile = async (data: {
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
  if (data.telefono && !isValidPhone(data.telefono)) {
    throw new Error('El formato del teléfono no es válido');
  }
  if (data.sitio_web && !isValidUrl(data.sitio_web)) {
    throw new Error('El formato de la URL no es válido');
  }
  const response = await api.put('/profile/me', data);
  return response.data;
};

export const createProfile = async (data: {
  tipo_perfil: 'postulante' | 'empresa';
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
  // Validate required field
  if (!['postulante', 'empresa'].includes(data.tipo_perfil)) {
    throw new Error('Tipo de perfil debe ser "postulante" o "empresa"');
  }
  // Validate optional fields
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

  const response = await api.post('/api/profile', {
    tipoPerfil: data.tipo_perfil, // Map to backend field name
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
  const response = await api.post(`/api/profile/${perfil_id}/foto`, photo, {
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
  descripcion: string;
  ubicacion: string;
  telefono: string;
  sitioWeb: string;
  experiencia: string;
  educacion: string;
  certificaciones: string;
  habilidades: string;
  intereses: string;
}

export const updateUserProfile = async (data: UpdateProfilePayload) => {
  try {
    const response = await api.put('/api/profile/me', data, {
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

export default api;