import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.0.12:8080'; // Replace with your actual API base URL, e.g., 'http://localhost:8080'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout for requests
});

// Add request interceptor for future JWT handling (not needed for register)
api.interceptors.request.use(
  (config) => {
    const token = AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors globally
    if (error.response) {
      // Server responded with a status other than 200 range
      const { status, data } = error.response;
      if (status === 400) {
        // Validation error, e.g., duplicate email
        return Promise.reject(new Error(data.message || 'Error de validación'));
      } else if (status === 401) {
        // Unauthorized, redirect to login if needed
        return Promise.reject(new Error('No autorizado'));
      } else if (status === 500) {
        return Promise.reject(new Error('Error en el servidor'));
      }
    } else if (error.request) {
      // No response received
      return Promise.reject(new Error('No se recibió respuesta del servidor'));
    } else {
      // Something happened in setting up the request
      return Promise.reject(new Error('Error de conexión'));
    }
    return Promise.reject(error);
  }
);

export const registerUser = async (data: { nombre: string; apellido: string; email: string; password: string }) => {
  try {
    const response = await api.post('/auth/register', data);
    return response.data;
  } catch (error) {
    throw error; // Let the caller handle the error
  }
};

// Placeholder for verify endpoint (add when backend is ready)
export const verifyCode = async (data: { email: string; code: string }) => {
  try {
    const response = await api.post('/auth/verify', data); // Assume endpoint /auth/verify
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (data: { email: string; password: string }) => {
  try {
    const response = await api.post('/auth/login', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/*User Profile API*/ 

export const getUserProfile = async () => {
  const response = await api.get('/api/profile/me'); // Assume endpoint to get current user profile
  return response.data;
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
  const response = await api.put('/api/perfiles/me', data);
  return response.data;
};

export const createProfile = async (data: {
  tipo_perfil: 'postulante' | 'empresa';
  descripcion?: string;
  ubicacion?: string;
  telefono?: string;
  sitio_web?: string;
  experiencia?: string;
  educacion?: string;
  certificaciones?: string;
  intereses?: string;
}) => {
  const response = await api.post('/api/profile', data);
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
  await api.patch('/api/usuarios/activo'); // Assume endpoint to update 'activo' field
};

// Export the api instance if needed for other calls
export default api;