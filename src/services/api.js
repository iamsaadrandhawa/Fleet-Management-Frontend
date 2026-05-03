import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || { message: error.message });
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// Driver APIs
export const driverAPI = {
  getAll: () => api.get('/drivers'),
  getById: (id) => api.get(`/drivers/${id}`),
  create: (data) => api.post('/drivers', data),
  update: (id, data) => api.put(`/drivers/${id}`, data),
  delete: (id) => api.delete(`/drivers/${id}`),
};

// Vehicle APIs
export const vehicleAPI = {
  getAll: () => api.get('/vehicles'),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

// User APIs
export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Ledger APIs
export const ledgerAPI = {
  getDesignations: () => api.get('/ledgers/designations'),
  getLocations: () => api.get('/ledgers/locations'),
  getMakes: () => api.get('/ledgers/makes'),
  getVehicleCategories: () => api.get('/ledgers/vehicle-categories'),
  getFuelTypes: () => api.get('/ledgers/fuel-types'),
  getTransmissions: () => api.get('/ledgers/transmissions'),
  
  // Create
  addDesignation: (data) => api.post('/ledgers/designations', data),
  addLocation: (data) => api.post('/ledgers/locations', data),
  addMake: (data) => api.post('/ledgers/makes', data),
  addVehicleCategory: (data) => api.post('/ledgers/vehicle-categories', data),
  addFuelType: (data) => api.post('/ledgers/fuel-types', data),
  addTransmission: (data) => api.post('/ledgers/transmissions', data),
  
  // Update
  updateDesignation: (id, data) => api.put(`/ledgers/designations/${id}`, data),
  updateLocation: (id, data) => api.put(`/ledgers/locations/${id}`, data),
  updateMake: (id, data) => api.put(`/ledgers/makes/${id}`, data),
  updateVehicleCategory: (id, data) => api.put(`/ledgers/vehicle-categories/${id}`, data),
  updateFuelType: (id, data) => api.put(`/ledgers/fuel-types/${id}`, data),
  updateTransmission: (id, data) => api.put(`/ledgers/transmissions/${id}`, data),
  
  // Delete
  deleteDesignation: (id) => api.delete(`/ledgers/designations/${id}`),
  deleteLocation: (id) => api.delete(`/ledgers/locations/${id}`),
  deleteMake: (id) => api.delete(`/ledgers/makes/${id}`),
  deleteVehicleCategory: (id) => api.delete(`/ledgers/vehicle-categories/${id}`),
  deleteFuelType: (id) => api.delete(`/ledgers/fuel-types/${id}`),
  deleteTransmission: (id) => api.delete(`/ledgers/transmissions/${id}`),
};

// Log APIs
export const logAPI = {
  getAll: () => api.get('/logs'),
  getRecent: (limit) => api.get(`/logs/recent?limit=${limit}`),
  getByUser: (userId) => api.get(`/logs/user/${userId}`),
  getByAction: (action) => api.get(`/logs/action/${action}`),
  getByEntity: (entityType) => api.get(`/logs/entity/${entityType}`),
  delete: (id) => api.delete(`/logs/${id}`),
  clearAll: () => api.delete('/logs'),
};

export default api;