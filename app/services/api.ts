import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.0.14:8080';

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
    console.log('JWT Token:', token); // Debug log 
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
      } else if (status === 403) {
        return Promise.reject(new Error('Acceso denegado: No tienes permiso para realizar esta acción'));
      } else if (status === 404) {
        return Promise.reject(new Error('Recurso no encontrado'));
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

// Interfaz actualizada para los datos de la oferta de trabajo (solo campos esenciales)
interface CreateJobOfferPayload {
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
  beneficios?: string;
  requisitos?: string;
  habilidadesRequeridas?: string;
  idiomas?: string;
  preguntasAdicionales?: string;
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
      aplicacionRapida: data.aplicacionRapida ?? true,
      permiteAplicacionExterna: data.permiteAplicacionExterna ?? false,
      beneficios: data.beneficios || '',
      requisitos: data.requisitos || '',
      habilidadesRequeridas: data.habilidadesRequeridas || '',
      idiomas: data.idiomas || '',
      preguntasAdicionales: data.preguntasAdicionales || '',
      urlAplicacionExterna: data.urlAplicacionExterna || '',
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

export const updateJobOffer = async (id: number, data: CreateJobOfferPayload) => {
  try {
    console.log('Updating job offer with ID:', id, 'and data:', JSON.stringify(data, null, 2)); // Debug log
    const response = await api.put(`/ofertas/${id}`, {
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
      aplicacionRapida: data.aplicacionRapida ?? true,
      permiteAplicacionExterna: data.permiteAplicacionExterna ?? false,
      beneficios: data.beneficios || '',
      requisitos: data.requisitos || '',
      habilidadesRequeridas: data.habilidadesRequeridas || '',
      idiomas: data.idiomas || '',
      preguntasAdicionales: data.preguntasAdicionales || '',
      urlAplicacionExterna: data.urlAplicacionExterna || '',
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Oferta actualizada:', response.data); // Debug log
    return response.data;
  } catch (error: any) {
    console.error('Error in updateJobOffer:', error); // Detailed error logging
    const errorMessage = error.response?.data?.message || error.message || 'Error desconocido al actualizar la oferta';
    throw new Error(`Error al actualizar la oferta: ${errorMessage}`);
  }
};

export const deleteJobOffer = async (id: number) => {
  try {
    console.log('Deleting job offer with ID:', id); // Debug log
    const response = await api.delete(`/ofertas/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Oferta eliminada:', response.status); // Debug log
    return response.status; // Returns 204 on success
  } catch (error: any) {
    console.error('Error in deleteJobOffer:', error); // Detailed error logging
    const errorMessage = error.response?.data?.message || error.message || 'Error desconocido al eliminar la oferta';
    throw new Error(`Error al eliminar la oferta: ${errorMessage}`);
  }
};

export const getCompanyId = async () => {
  try {
    const response = await api.get('/api/perfiles/empresa/id');
    return response.data; 
  } catch (error) {
    throw new Error('Error al obtener el ID de la empresa: ' + (error as Error).message);
  }
};

export const getJobOffersByCompany = async (empresaId: number) => {
  try {
    const response = await api.get(`/ofertas/empresa/${empresaId}`);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener las ofertas de la empresa: ' + (error as Error).message);
  }
};

export const getJobOfferDetails = async (ofertaId: number) => {
  try {
    const response = await api.get(`/ofertas/${ofertaId}`);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los detalles de la oferta: ' + (error as Error).message);
  }
};

export const getJobOffers = async () => {
  try {
    const response = await api.get('/ofertas/publico');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener las ofertas de trabajo: ' + (error as Error).message);
  }
}

export const likeJobOffer = async (ofertaId: number) => {
  try {
    const response = await api.post(`/api/likes/oferta/${ofertaId}`);
    return response.data;
  } catch (error) {
    throw new Error('Error al dar like a la oferta: ' + (error as Error).message);
  }
}

export const rejectJobOffer = async (ofertaId: number) => {
  try {
    const response = await api.post(`/api/passes/oferta/${ofertaId}`);
    return response.data;
  } catch (error) {
    throw new Error('Error al rechazar la oferta: ' + (error as Error).message);
  }
}

export const superLikeJobOffer = async (ofertaId: number) => {
  try {
    const response = await api.post(`/api/likes/swipe/superlike/${ofertaId}`);
    return response.data;
  } catch (error) {
    throw new Error('Error al dar superlike a la oferta: ' + (error as Error).message);
  }
};

// Interfaz para la respuesta del endpoint
interface MatchUsuarioResponse {
  postulacionId: number;
  ofertaId: number;
  tituloOferta: string;
  descripcionOferta: string;
  ubicacionOferta: string;
  empresaNombre: string;
  empresaDescripcion: string;
  fechaPostulacion: string;
  estado: string;
  superLike: boolean;
}

// Estados de postulación válidos
export type EstadoPostulacion = 
  | 'PENDIENTE' 
  | 'REVISADA' 
  | 'ACEPTADA' 
  | 'RECHAZADA';

/**
 * Obtiene las postulaciones/matches del usuario autenticado
 * @param estado - Estado opcional para filtrar las postulaciones
 * @returns Promise con array de MatchUsuarioResponse
 */
export const getUserApplications = async (estado?: EstadoPostulacion): Promise<MatchUsuarioResponse[]> => {
  try {
    let url = '/api/matches/usuario';
    if (estado) {
      url += `?estadoParam=${estado}`;
    }

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching user applications:', error);
    throw new Error('Error al obtener las postulaciones: ' + (error as Error).message);
  }
};

/**
 * Obtiene los detalles de una postulación específica del usuario
 * @param postulacionId - ID de la postulación
 * @returns Promise con los detalles de la postulación
 */
export const getApplicationDetails = async (postulacionId: number): Promise<MatchUsuarioResponse> => {
  try {
    const response = await api.get(`/api/matches/usuario/${postulacionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching application details:', error);
    throw new Error('Error al obtener los detalles de la postulación: ' + (error as Error).message);
  }
};

// Actualizar esta función para usar 'token' en lugar de 'authToken'
export const getAuthToken = async (): Promise<string> => {
  const token = await AsyncStorage.getItem('token'); // Cambiado de 'authToken' a 'token'
  if (!token) {
    throw new Error('No se encontró token de autenticación. Por favor, inicia sesión.');
  }
  return token;
};

export const isValidEstadoPostulacion = (estado: string): estado is EstadoPostulacion => {
  const validEstados: EstadoPostulacion[] = ['PENDIENTE', 'REVISADA', 'ACEPTADA', 'RECHAZADA'];
  return validEstados.includes(estado as EstadoPostulacion);
};

// Interfaces para los nuevos endpoints
export interface LikeResponse {
  likeId: number;
  usuarioEmail: string;
  fechaLike: string;
  tipoLike: string; // 'LIKE' o 'SUPER_LIKE'
}

export interface PerfilPublicoResponse {
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

// Función para obtener perfil público por email
export const getPerfilPublicoPorEmail = async (email: string): Promise<PerfilPublicoResponse> => {
  const token = await AsyncStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  const response = await fetch(`${API_BASE_URL}/api/perfiles/publico?email=${encodeURIComponent(email)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.mensaje || 'Error al obtener perfil público');
  }

  return response.json();
};

// Función para obtener likes por oferta
export const getLikesByOferta = async (ofertaId: number): Promise<LikeResponse[]> => {
  const token = await AsyncStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  const response = await fetch(`${API_BASE_URL}/api/likes/oferta/${ofertaId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.mensaje || 'Error al obtener postulantes');
  }

  return response.json();
};

  export const createMatch = async (likeId: number) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    try {
      const response = await api.post(
        `/api/matches/like/${likeId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating match:', error);
      throw error;
    }
  };

export const getMatchesByOffer = async (ofertaId: number) => {
  try {
    const response = await api.get(`/api/matches/oferta/${ofertaId}`);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los matches de la oferta: ' + (error as Error).message);
  }
}

export const rejectUserProfile = async (likeId: number) => {
  const token = await AsyncStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  try {
    const response = await api.post(
      `/api/passes/like/${likeId}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error rejecting user profile:', error);
    throw error;
  }
};

// services/api.ts - Agregar estas interfaces y funciones al archivo existente

export interface ChatResponse {
  id: number;
  ofertaId: number;
  tituloOferta: string;
  nombreContraparte: string;
  ultimoMensaje: string;
  ultimaActividad: string;
  noLeidos: number;
}

export interface MensajeResponse {
  id: number;
  chatId: number;
  remitenteId: number;
  contenido: string;
  fechaEnvio: string;
}

export interface MensajesPorChatResponse {
  chatId: number;
  mensajes: MensajeResponse[];
}

export interface MensajeRequest {
  ofertaId: number;
  contenido: string;
}

// Funciones de Chat
export const obtenerChats = async (): Promise<ChatResponse[]> => {
  try {
    const response = await api.get('/api/chat/chats');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener chats: ' + (error as Error).message);
  }
};

export const obtenerMensajes = async (chatId: number): Promise<MensajesPorChatResponse> => {
  try {
    const response = await api.get(`/api/chat/mensajes/${chatId}`);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener mensajes: ' + (error as Error).message);
  }
};

export const enviarMensaje = async (request: MensajeRequest): Promise<MensajeResponse> => {
  try {
    const response = await api.post('/api/chat/mensaje', request);
    return response.data;
  } catch (error) {
    throw new Error('Error al enviar mensaje: ' + (error as Error).message);
  }
};

//Funciones estadísticas y Badges

// Interfaces for DTOs
export interface ProfileFormData {
  nombre_empresa: string;
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

export interface ActividadRecienteResponse {
  tipo: string; // "MATCH", "LIKE", "SUPERLIKE", "BADGE_OBTENIDO"
  descripcion: string;
  fecha: string;
  icono: string;
  color: string;
  tiempoTranscurrido: string;
  datosAdicionales: any;
}

export interface BadgeConfigResponse {
  id: number;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  tipo: string;
  condicionRequerida: number;
  activo: boolean;
  fechaCreacion: string;
  totalUsuariosConBadge: number;
  porcentajeUsuarios: number;
  usuariosRecientes: UsuarioConBadgeResponse[];
}

export interface BadgeDistribucionResponse {
  nombreBadge: string;
  icono: string;
  color: string;
  cantidadUsuarios: number;
  porcentajeUsuarios: number;
  rareza: string; // "COMÚN", "RARO", "ÉPICO", "LEGENDARIO"
}

export interface BadgeObtenidoResponse {
  nuevosBadges: BadgeResponse[];
  mensaje: string;
  mostrarNotificacion: boolean;
  fechaObtenido: string;
  puntosGanados: number;
  subirNivel: boolean;
  nivelAnterior: number;
  nivelNuevo: number;
  mensajesMotivacionales: string[];
}

export interface BadgeRequest {
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  tipo: string;
  condicionRequerida: number;
  activo: boolean;
}

export interface BadgeResponse {
  id: number;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  tipo: string;
  tipoDisplay: string;
  condicionRequerida: number;
  fechaObtenido: string | null;
  progresoActual: number;
  activo: boolean;
  obtenido: boolean;
}

export interface EstadisticasGlobalesResponse {
  totalUsuarios: number;
  totalMatches: number;
  totalLikes: number;
  totalSuperLikes: number;
  promedioMatchesPorUsuario: number;
  promedioLikesPorUsuario: number;
  tasaExitoPromedio: number;
  distribucionBadges: BadgeDistribucionResponse[];
  topUsuariosPorBadges: RankingUsuarioResponse[];
  topUsuariosPorMatches: RankingUsuarioResponse[];
  usuariosActivosUltimos7Dias: number;
  usuariosActivosUltimos30Dias: number;
  perfilesCompletados: number;
}

export interface EstadisticaUsuarioResponse {
  perfilId: number;
  totalMatches: number;
  totalLikesDados: number;
  totalLikesRecibidos: number;
  totalSuperlikesDados: number;
  totalSuperlikesRecibidos: number;
  totalRechazosDados: number;
  totalRechazosRecibidos: number;
  perfilCompletado: boolean;
  porcentajePerfil: number;
  diasActivo: number;
  ultimaActividad: string;
  fechaRegistro: string;
  fechaActualizacion: string;
  tasaExito: number;
  popularidad: number;
  tasaRespuesta: number;
  totalBadges: number;
  rendimientoVsPromedio: string;
  posicionRanking: number;
}

export interface LogroDestacadoResponse {
  titulo: string;
  descripcion: string;
  icono: string;
  color: string;
  valor: number;
  categoria: string;
  esReciente: boolean;
}

export interface NotificacionBadgeResponse {
  id: number;
  badge: BadgeResponse;
  fechaObtenido: string;
  leida: boolean;
  mensaje: string;
  tipo: string; // "BADGE_NUEVO", "PROGRESO", "NIVEL_SUBIDO"
}

export interface EstadisticasEmpresaResponse {
  totalOfertas: number;
  totalPostulaciones: number;
  totalMatches: number;
  totalSuperlikes: number;
  totalRechazosEmpresa: number;
  totalRechazosPostulante: number;
  totalContactados: number;
  totalVistas: number;
  tasaAceptacion: number;
  tasaRechazoEmpresa: number;
  tasaRechazo: number;
  tasaContacto: number;
}

export interface EstadisticasOfertaResponse {
  vistasOferta: number;
  totalPostulaciones: number;
  totalMatches: number;
  totalSuperlikes: number;
  totalRechazosEmpresa: number;
  totalRechazosPostulante: number;
  totalContactados: number;
  tasaAceptacion: number;
  tasaRechazoEmpresa: number;
  tasaRechazo: number;
  tasaContacto: number;
}

export interface PerfilConEstadisticasResponse {
  perfilId: number;
  nombreCompleto: string;
  email: string;
  tipoPerfil: string;
  nombreEmpresa?: string;
  descripcion?: string;
  ubicacion?: string;
  telefono?: string;
  sitioWeb?: string;
  experiencia?: string;
  habilidades?: string;
  educacion?: string;
  certificaciones?: string;
  intereses?: string;
  fotoUrl?: string;
  estadisticas: EstadisticaUsuarioResponse;
  badges: UsuarioBadgeResponse[];
  badgesRecientes: UsuarioBadgeResponse[];
  badgesDisponibles: BadgeResponse[];
  proximosBadges: ProgresoResponse[];
  nivelUsuario: number;
  titulo: string;
  puntosExperiencia: number;
  puntosParaProximoNivel: number;
  progresoNivel: number;
  ultimaConexion?: string;
  actividadReciente: ActividadRecienteResponse[];
  logrosDestacados: LogroDestacadoResponse[];
  estadisticasEmpresa?: EstadisticasEmpresaResponse;
}

export interface ProgresoResponse {
  nombreBadge: string;
  descripcion: string;
  icono: string;
  color: string;
  progresoActual: number;
  progresoRequerido: number;
  porcentajeCompletado: number;
}

export interface RankingUsuarioResponse {
  perfilId: number;
  nombreCompleto: string;
  fotoUrl: string | null;
  posicion: number;
  totalBadges: number;
  nivelUsuario: number;
  titulo: string;
  puntuacion: number;
  esUsuarioActual: boolean;
}

export interface UsuarioBadgeResponse {
  id: number;
  badge: BadgeResponse;
  fechaObtenido: string;
  progresoActual: number;
  esNuevo: boolean;
  notificado: boolean;
  tiempoTranscurrido: string;
}

export interface UsuarioConBadgeResponse {
  perfilId: number;
  nombreCompleto: string;
  email: string;
  fotoUrl: string | null;
  fechaObtenido: string;
  tiempoTranscurrido: string;
}

export const obtenerBadgesUsuario = async (): Promise<UsuarioBadgeResponse[]> => {
  const token = await AsyncStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  try {
    const response = await api.get('/api/badges/usuario', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los badges del usuario: ' + (error as Error).message);
  }
};

export const obtenerTodosBadges = async (): Promise<BadgeResponse[]> => {
  const token = await AsyncStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  try {
    const response = await api.get('/api/badges/todos', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener todos los badges: ' + (error as Error).message);
  }
};

export const obtenerProgresoBadges = async (): Promise<ProgresoResponse[]> => {
  const token = await AsyncStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  try {
    const response = await api.get('/api/badges/progreso', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener el progreso de badges: ' + (error as Error).message);
  }
};

export const verificarNuevosBadges = async (): Promise<BadgeObtenidoResponse> => {
  const token = await AsyncStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  try {
    const response = await api.post(
      '/api/badges/verificar',
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error('Error al verificar nuevos badges: ' + (error as Error).message);
  }
};

export const marcarBadgesNotificados = async (): Promise<void> => {
  const token = await AsyncStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  try {
    await api.post(
      '/api/badges/marcar-notificados',
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    throw new Error('Error al marcar badges como notificados: ' + (error as Error).message);
  }
};

export const obtenerEstadisticasUsuario = async (): Promise<EstadisticaUsuarioResponse> => {
  const token = await AsyncStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  try {
    const response = await api.get('/api/badges/estadisticas', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener estadísticas del usuario: ' + (error as Error).message);
  }
};

export const obtenerPerfilConEstadisticas = async (): Promise<PerfilConEstadisticasResponse> => {
  const token = await AsyncStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  try {
    const response = await api.get('/api/badges/perfil-completo', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener perfil con estadísticas: ' + (error as Error).message);
  }
};

// Interfaces para estadísticas de empresa
export interface EstadisticasOfertaResponse {
  ofertaId: number;
  titulo: string;
  descripcion: string;
  totalPostulaciones: number;
  totalMatches: number;
  totalSuperlikes: number;
  totalRechazosEmpresa: number;
  totalRechazosPostulante: number;
  totalContactados: number;
  vistasOferta: number;
  vacantesDisponibles: number;
  estadoOferta: string;
  nivelExperiencia: string;
  tipoTrabajo: string;
  tipoContrato: string;
  diasActiva: number;
  fechaCreacion: string;
  fechaActualizacion: string;
  tasaAceptacion: number;
  tasaRechazoEmpresa: number;
  tasaRechazo: number;
  tasaContacto: number;
}

// Función para obtener estadísticas de una oferta
export const obtenerEstadisticasOferta = async (ofertaId: number): Promise<EstadisticasOfertaResponse> => {
  try {
    const response = await api.get(`/ofertas/${ofertaId}/estadisticas`);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener estadísticas de la oferta: ' + (error as Error).message);
  }
};

export const obtenerEstadisticasEmpresa = async () => {
  try {
    const response = await api.get('/api/perfiles/empresa/estadisticas');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener estadísticas de la empresa: ' + (error as Error).message);
  }
}

export interface OfertaResponse {
  id: number;
  titulo: string;
  descripcion: string;
  empresaNombre: string;
  empresaId: number;
  ubicacion: string;
  tipoTrabajo: string;
  tipoContrato: string;
  tipoContratoDescripcion?: string;
  nivelExperiencia: string;
  salarioFormateado: string;
  areaTrabajo: string;
  salarioMinimo?: number;
  salarioMaximo?: number;
  moneda?: string;
  aplicacionesRecibidas: number;
  tiempoPublicacion: string;
  aplicacionRapida?: boolean;
  permiteAplicacionExterna?: boolean;
}

// Funciones de guardado de ofertas
export const toggleGuardarOferta = async (ofertaId: number): Promise<OfertaResponse> => {
  try {
    const response = await api.post(`/ofertas/${ofertaId}/guardar`);
    return response.data;
  } catch (error) {
    throw new Error('Error al guardar/desguardar oferta: ' + (error as Error).message);
  }
};

export const obtenerOfertasGuardadas = async (page: number = 0, size: number = 20) => {
  try {
    const response = await api.get('/ofertas/guardadas', {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener ofertas guardadas: ' + (error as Error).message);
  }
};

export const verificarOfertaGuardada = async (ofertaId: number): Promise<boolean> => {
  try {
    const ofertas = await obtenerOfertasGuardadas();
    return ofertas.content.some((oferta: any) => oferta.id === ofertaId);
  } catch (error) {
    return false;
  }
};

export default api;