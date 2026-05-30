// services/api.js
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
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
   delete: (id) => {
        console.log('Soft delete (deactivate) user:', id);
        return api.delete(`/users/${id}`);
    },
    
    // Hard delete (permanent removal)
    hardDelete: (id) => {
        console.log('Hard delete (permanent) user:', id);
        return api.delete(`/users/${id}/hard`);
    },    
  getByEmail: (email) => api.get(`/users/email/${email}`),
  getByRole: (role) => api.get(`/users/role/${role}`),
  getStats: () => api.get('/users/stats'),
  bulkUpdateStatus: (data) => api.patch('/users/bulk-status', data),
};

// Ledger APIs (Updated with Roles)
export const ledgerAPI = {
  // Get all ledgers grouped
  getAll: () => api.get('/ledgers/all'),

  // Get by type
  getByType: (type) => api.get(`/ledgers/type/${type}`),

  // ==================== ROLES ====================
  getRoles: () => api.get('/ledgers/roles'),
  addRole: (data) => api.post('/ledgers/roles', data),
  updateRole: (id, data) => api.put(`/ledgers/roles/${id}`, data),
  deleteRole: (id) => api.delete(`/ledgers/roles/${id}`),

  // ==================== DESIGNATIONS ====================
  getDesignations: () => api.get('/ledgers/designations'),
  addDesignation: (data) => api.post('/ledgers/designations', data),
  updateDesignation: (id, data) => api.put(`/ledgers/designations/${id}`, data),
  deleteDesignation: (id) => api.delete(`/ledgers/designations/${id}`),

  // ==================== LOCATIONS ====================
  getLocations: () => api.get('/ledgers/locations'),
  addLocation: (data) => api.post('/ledgers/locations', data),
  updateLocation: (id, data) => api.put(`/ledgers/locations/${id}`, data),
  deleteLocation: (id) => api.delete(`/ledgers/locations/${id}`),

  // ==================== MAKES ====================
  getMakes: () => api.get('/ledgers/makes'),
  addMake: (data) => api.post('/ledgers/makes', data),
  updateMake: (id, data) => api.put(`/ledgers/makes/${id}`, data),
  deleteMake: (id) => api.delete(`/ledgers/makes/${id}`),

  // ==================== VEHICLE CATEGORIES ====================
  getVehicleCategories: () => api.get('/ledgers/vehicle-categories'),
  addVehicleCategory: (data) => api.post('/ledgers/vehicle-categories', data),
  updateVehicleCategory: (id, data) => api.put(`/ledgers/vehicle-categories/${id}`, data),
  deleteVehicleCategory: (id) => api.delete(`/ledgers/vehicle-categories/${id}`),

  // ==================== FUEL TYPES ====================
  getFuelTypes: () => api.get('/ledgers/fuel-types'),
  addFuelType: (data) => api.post('/ledgers/fuel-types', data),
  updateFuelType: (id, data) => api.put(`/ledgers/fuel-types/${id}`, data),
  deleteFuelType: (id) => api.delete(`/ledgers/fuel-types/${id}`),

  // ==================== TRANSMISSIONS ====================
  getTransmissions: () => api.get('/ledgers/transmissions'),
  addTransmission: (data) => api.post('/ledgers/transmissions', data),
  updateTransmission: (id, data) => api.put(`/ledgers/transmissions/${id}`, data),
  deleteTransmission: (id) => api.delete(`/ledgers/transmissions/${id}`),
};

// Log APIs
export const logAPI = {
  getAll: () => api.get('/audit-logs'),
  getRecent: (limit) => api.get(`/audit-logs/recent?limit=${limit}`),
  getByUser: (userId) => api.get(`/audit-logs/user/${userId}`),
  getByAction: (action) => api.get(`/audit-logs/action/${action}`),
  getByEntity: (entityType) => api.get(`/audit-logs/entity/${entityType}`),
  delete: (id) => api.delete(`/audit-logs/${id}`),
  clearAll: () => api.delete('/audit-logs'),
};

export default api;