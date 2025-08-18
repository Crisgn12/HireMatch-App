import axios from 'axios';

const API_BASE_URL = 'http://your-api-base-url'; // Replace with your actual API base URL, e.g., 'http://localhost:8080'

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
    // If token is available (e.g., after login), add it here
    // const token = getTokenFromStorage(); // Placeholder
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
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

// Export the api instance if needed for other calls
export default api;