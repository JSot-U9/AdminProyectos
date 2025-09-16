// src/services/apiService.js
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Configurar axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Mostrar mensaje de error
    const message = error.response?.data?.error || 'Error de conexión';
    toast.error(message);
    
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  // Login
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      toast.success('Inicio de sesión exitoso');
      return { token, user };
    } catch (error) {
      throw error;
    }
  },

  // Registro
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      toast.success('Usuario registrado exitosamente');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.info('Sesión cerrada');
    window.location.href = '/login';
  },

  // Verificar token
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

// Servicios de usuarios
export const userService = {
  // Obtener todos los usuarios
  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener usuario por ID
  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear nuevo usuario
  createUser: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      toast.success('Usuario creado exitosamente');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar usuario
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      toast.success('Usuario actualizado exitosamente');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cambiar contraseña
  changePassword: async (id, passwordData) => {
    try {
      const response = await api.put(`/users/${id}/password`, passwordData);
      toast.success('Contraseña actualizada exitosamente');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar usuario
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      toast.success('Usuario eliminado exitosamente');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Utilidades
export const apiUtils = {
  // Manejar errores de forma consistente
  handleError: (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // Error de respuesta del servidor
      const message = error.response.data?.error || 'Error del servidor';
      return { error: message, status: error.response.status };
    } else if (error.request) {
      // Error de red
      return { error: 'Error de conexión', status: 0 };
    } else {
      // Error de configuración
      return { error: 'Error inesperado', status: -1 };
    }
  },

  // Formatear datos para envío
  formatUserData: (userData) => {
    return {
      nombre: userData.nombre?.trim(),
      email: userData.email?.toLowerCase().trim(),
      telefono: userData.telefono?.trim(),
      rol: userData.rol || 'Responsable de tarea',
      habilitado: userData.habilitado !== undefined ? userData.habilitado : true,
      ...(userData.password && { password: userData.password })
    };
  }
};

export default api;