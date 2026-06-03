// stores/logStore.js - Complete fixed version
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

// Global deduplication tracking
const pendingRequests = new Map();
const completedRequests = new Map();

// ✅ Enhanced login tracking
let lastLoginTime = 0;
let lastLoginEmail = null;
let loginPromise = null;

const useLogStore = create(
  (set, get) => ({
    logs: [],
    isLoading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0
    },
    filters: {
      module: null,
      action: null,
      userId: null,
      startDate: null,
      endDate: null,
      search: ''
    },

    /**
     * Generate a unique fingerprint for a log entry
     */
    generateFingerprint: (logEntry) => {
      const timestamp = Math.floor(Date.now() / 5000);
      return `${logEntry.action}_${logEntry.module}_${logEntry.userEmail}_${logEntry.targetId}_${logEntry.status}_${timestamp}`;
    },

    /**
     * Check if this log is a duplicate
     */
    isDuplicate: (fingerprint) => {
      if (pendingRequests.has(fingerprint)) {
        console.log('Duplicate prevented - request pending:', fingerprint);
        return true;
      }
      
      if (completedRequests.has(fingerprint)) {
        const timestamp = completedRequests.get(fingerprint);
        if (Date.now() - timestamp < 5000) {
          console.log('Duplicate prevented - recent request:', fingerprint);
          return true;
        }
        completedRequests.delete(fingerprint);
      }
      
      return false;
    },

    /**
     * Add a new log entry with strong duplicate prevention
     */
    addLog: async (logEntry) => {
      const fingerprint = get().generateFingerprint(logEntry);
      
      if (get().isDuplicate(fingerprint)) {
        console.log('🚫 Duplicate log blocked:', logEntry.action, logEntry.module);
        return null;
      }
      
      pendingRequests.set(fingerprint, Date.now());
      set({ isLoading: true, error: null });
      
      try {
        let user = {};
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            user = JSON.parse(userStr);
          } else {
            const token = localStorage.getItem('token');
            if (token) {
              try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                user = { id: payload.id, email: payload.email, role: payload.role, name: payload.name };
              } catch (e) {}
            }
          }
        } catch (e) {
          console.error('Failed to get user:', e);
        }
        
        const enrichedData = {
          userId: logEntry.userId || user.id,
          userEmail: logEntry.userEmail || user.email,
          userRole: logEntry.userRole || user.role,
          userName: logEntry.userName || user.name,
          action: logEntry.action,
          module: logEntry.module || logEntry.entityType,
          targetId: logEntry.targetId || logEntry.entityId,
          targetModel: logEntry.targetModel,
          targetName: logEntry.targetName,
          changes: logEntry.changes || {},
          status: logEntry.status || 'SUCCESS',
          description: logEntry.description,
          errorMessage: logEntry.errorMessage,
          metadata: {
            ...logEntry.metadata,
            clientTimestamp: new Date().toISOString(),
            clientId: Math.random().toString(36).substring(7)
          },
          requestInfo: {
            url: window.location.pathname,
            userAgent: navigator.userAgent,
            method: 'FRONTEND',
            timestamp: new Date().toISOString()
          }
        };
        
        const response = await api.post('/audit-logs', enrichedData);
        
        const newLog = {
          id: response?.data?._id || response?._id || Date.now(),
          _id: response?.data?._id || response?._id,
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          ...enrichedData,
        };
        
        set((state) => ({
          logs: [newLog, ...state.logs.slice(0, 499)],
          isLoading: false
        }));
        
        completedRequests.set(fingerprint, Date.now());
        
        setTimeout(() => {
          completedRequests.delete(fingerprint);
          pendingRequests.delete(fingerprint);
        }, 5000);
        
        return response || newLog;
      } catch (error) {
        console.error('Failed to save log:', error);
        set({ isLoading: false, error: error.message });
        pendingRequests.delete(fingerprint);
        return null;
      }
    },

    /**
     * ✅ FIXED: Login log with multiple layers of deduplication
     */
    logLogin: async (status = 'SUCCESS', errorMessage = null, userEmail = null) => {
      // Get current user email
      let currentUserEmail = userEmail;
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          currentUserEmail = currentUserEmail || user.email;
        }
        if (!currentUserEmail) {
          const token = localStorage.getItem('token');
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              currentUserEmail = currentUserEmail || payload.email;
            } catch (e) {}
          }
        }
      } catch (e) {
        console.error('Failed to get user:', e);
      }
      
      const now = Date.now();
      
      // ✅ Layer 1: Check if there's already a login promise in progress
      if (loginPromise) {
        console.log('🚫 Login log already in progress, returning existing promise');
        return loginPromise;
      }
      
      // ✅ Layer 2: Check in-memory cache (within 5 seconds)
      if (currentUserEmail === lastLoginEmail && (now - lastLoginTime) < 5000) {
        console.log('🚫 Duplicate login log prevented (memory cache):', currentUserEmail);
        return null;
      }
      
      // ✅ Layer 3: Check session storage
      const sessionKey = `last_login_${currentUserEmail}`;
      const lastLoginSession = sessionStorage.getItem(sessionKey);
      if (lastLoginSession && (now - parseInt(lastLoginSession)) < 5000) {
        console.log('🚫 Duplicate login log prevented (session storage):', currentUserEmail);
        return null;
      }
      
      // ✅ Layer 4: Check local storage (across tabs)
      const globalKey = `global_login_${currentUserEmail}`;
      const lastLoginGlobal = localStorage.getItem(globalKey);
      if (lastLoginGlobal && (now - parseInt(lastLoginGlobal)) < 5000) {
        console.log('🚫 Duplicate login log prevented (local storage):', currentUserEmail);
        return null;
      }
      
      // Update all tracking mechanisms
      lastLoginTime = now;
      lastLoginEmail = currentUserEmail;
      sessionStorage.setItem(sessionKey, now.toString());
      localStorage.setItem(globalKey, now.toString());
      
      // Clean up local storage after 5 seconds
      setTimeout(() => {
        localStorage.removeItem(globalKey);
      }, 5000);
      
      // Create the log with a promise to prevent concurrent calls
      loginPromise = get().addLog({
        action: 'LOGIN',
        module: 'AUTH',
        status,
        errorMessage,
        userEmail: currentUserEmail,
        description: status === 'SUCCESS' 
          ? `User ${currentUserEmail || ''} logged in successfully` 
          : `Failed login attempt for ${currentUserEmail || ''}: ${errorMessage}`,
        metadata: {
          loginTime: new Date().toISOString(),
          status: status
        }
      });
      
      // Clear the promise after completion
      const result = await loginPromise;
      loginPromise = null;
      
      return result;
    },

    /**
     * Logout log with deduplication
     */
    logLogout: async (userEmail = null) => {
      const sessionKey = `last_logout_${userEmail}`;
      const lastLogout = sessionStorage.getItem(sessionKey);
      const now = Date.now();
      
      if (lastLogout && (now - parseInt(lastLogout)) < 3000) {
        console.log('🚫 Duplicate logout log prevented');
        return null;
      }
      
      sessionStorage.setItem(sessionKey, now.toString());
      
      return get().addLog({
        action: 'LOGOUT',
        module: 'AUTH',
        userEmail,
        description: `User ${userEmail || ''} logged out`,
        metadata: {
          logoutTime: new Date().toISOString()
        }
      });
    },

    /**
     * Convenience method for CREATE action
     */
    logCreate: async (module, targetId, targetName, metadata = {}) => {
      const fingerprint = get().generateFingerprint({ action: 'CREATE', module, targetId, userEmail: metadata.userEmail });
      if (get().isDuplicate(fingerprint)) return null;
      
      return get().addLog({
        action: 'CREATE',
        module,
        targetId,
        targetModel: get().getModelName(module),
        targetName,
        metadata,
        description: `Created new ${module.toLowerCase()}: ${targetName}`
      });
    },

    /**
     * Convenience method for UPDATE action
     */
    logUpdate: async (module, targetId, targetName, changes, metadata = {}) => {
      if (!changes || Object.keys(changes).length === 0) {
        console.log('Skipping UPDATE log - no changes detected');
        return null;
      }
      
      const fingerprint = get().generateFingerprint({ action: 'UPDATE', module, targetId });
      if (get().isDuplicate(fingerprint)) return null;
      
      return get().addLog({
        action: 'UPDATE',
        module,
        targetId,
        targetModel: get().getModelName(module),
        targetName,
        changes,
        metadata,
        description: `Updated ${module.toLowerCase()}: ${targetName}`
      });
    },

    /**
     * Convenience method for DELETE action
     */
    logDelete: async (module, targetId, targetName, metadata = {}) => {
      const fingerprint = get().generateFingerprint({ action: 'DELETE', module, targetId });
      if (get().isDuplicate(fingerprint)) return null;
      
      return get().addLog({
        action: 'DELETE',
        module,
        targetId,
        targetModel: get().getModelName(module),
        targetName,
        metadata,
        description: `Deleted ${module.toLowerCase()}: ${targetName}`
      });
    },

    /**
     * Convenience method for VIEW action
     */
    logView: async (module, targetId, targetName) => {
      return get().addLog({
        action: 'VIEW',
        module,
        targetId,
        targetModel: get().getModelName(module),
        targetName,
        description: `Viewed ${module.toLowerCase()}: ${targetName}`
      });
    },

    /**
     * Get model name from module
     */
    getModelName: (module) => {
      const map = {
        'USER': 'User',
        'DRIVER': 'Driver',
        'VEHICLE': 'Vehicle',
        'MAINTENANCE': 'Maintenance',
        'ROLE': 'Role',
        'AUTH': 'Auth',
        'SYSTEM': 'System',
        'LOCATION': 'Location',
        'MAKE': 'Make',
        'DESIGNATION': 'Designation'
      };
      return map[module] || module;
    },

    /**
     * Fetch logs from API with pagination and filters
     */
    fetchLogs: async (page = 1, filters = {}) => {
      set({ isLoading: true, error: null });
      
      try {
        const limit = filters.limit || 20;
        const queryParams = new URLSearchParams({
          page,
          limit,
          sort: '-createdAt'
        });
        
        if (filters.module) queryParams.append('module', filters.module);
        if (filters.action) queryParams.append('action', filters.action);
        if (filters.userId) queryParams.append('userId', filters.userId);
        if (filters.userRole) queryParams.append('userRole', filters.userRole);
        if (filters.startDate) queryParams.append('startDate', filters.startDate);
        if (filters.endDate) queryParams.append('endDate', filters.endDate);
        if (filters.search) queryParams.append('search', filters.search);
        
        const response = await api.get(`/audit-logs?${queryParams}`);
        
        let logsData = [];
        let total = 0;
        
        if (response) {
          if (Array.isArray(response.data)) {
            logsData = response.data;
            total = response.total || response.count || logsData.length;
          } else if (response.data && response.data.logs) {
            logsData = response.data.logs;
            total = response.data.total || response.data.count || logsData.length;
          } else if (response.data && response.data.data) {
            logsData = response.data.data;
            total = response.data.total || response.data.count || logsData.length;
          }
        }
        
        const paginationData = {
          page: page,
          limit: limit,
          total: total,
          pages: Math.ceil(total / limit)
        };
        
        set({
          logs: logsData,
          pagination: paginationData,
          isLoading: false,
          error: null
        });
        
        return {
          data: logsData,
          ...paginationData
        };
      } catch (error) {
        console.error('Error fetching logs:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch logs';
        set({ 
          error: errorMessage,
          isLoading: false,
          logs: []
        });
        return { 
          data: [], 
          total: 0, 
          page: page, 
          pages: 0,
          error: errorMessage
        };
      }
    },

    /**
     * Fetch single log by ID
     */
    fetchLogById: async (id) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await api.get(`/audit-logs/${id}`);
        set({ isLoading: false });
        return response?.data || response;
      } catch (error) {
        console.error('Error fetching log by ID:', error);
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },

    /**
     * Delete a log by ID (Admin only)
     */
    deleteLog: async (id) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await api.delete(`/audit-logs/${id}`);
        
        set((state) => ({
          logs: state.logs.filter(log => log._id !== id && log.id !== id),
          pagination: {
            ...state.pagination,
            total: Math.max(0, state.pagination.total - 1),
            pages: Math.ceil(Math.max(0, state.pagination.total - 1) / state.pagination.limit)
          },
          isLoading: false
        }));
        
        return response;
      } catch (error) {
        console.error('Error deleting log:', error);
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },

    /**
     * Delete multiple logs by IDs (Admin only)
     */
    deleteMultipleLogs: async (ids) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await api.post('/audit-logs/delete-many', { ids });
        
        set((state) => ({
          logs: state.logs.filter(log => !ids.includes(log._id) && !ids.includes(log.id)),
          pagination: {
            ...state.pagination,
            total: Math.max(0, state.pagination.total - ids.length),
            pages: Math.ceil(Math.max(0, state.pagination.total - ids.length) / state.pagination.limit)
          },
          isLoading: false
        }));
        
        return response;
      } catch (error) {
        console.error('Error deleting multiple logs:', error);
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },

    /**
     * Clear all logs (Admin only)
     */
    clearAllLogs: async () => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await api.delete('/audit-logs/');
        
        set({ 
          logs: [], 
          isLoading: false,
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            pages: 0
          }
        });
        
        return response;
      } catch (error) {
        console.error('Error clearing logs:', error);
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },

    /**
     * Get recent logs from state
     */
    getRecentLogs: (limit = 20) => {
      return get().logs.slice(0, limit);
    },

    /**
     * Get all logs from state
     */
    getAllLogs: () => {
      return get().logs;
    },

    /**
     * Get current pagination info
     */
    getPaginationInfo: () => {
      return get().pagination;
    },

    /**
     * Get current filters
     */
    getCurrentFilters: () => {
      return get().filters;
    },

    /**
     * Set filters
     */
    setFilters: (filters) => {
      set((state) => ({
        filters: { ...state.filters, ...filters }
      }));
    },

    /**
     * Reset all filters
     */
    resetFilters: () => {
      set({
        filters: {
          module: null,
          action: null,
          userId: null,
          startDate: null,
          endDate: null,
          search: ''
        }
      });
    },

    /**
     * Clear error message
     */
    clearError: () => {
      set({ error: null });
    },

    /**
     * Reset store to initial state
     */
    resetStore: () => {
      set({
        logs: [],
        isLoading: false,
        error: null,
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0
        },
        filters: {
          module: null,
          action: null,
          userId: null,
          startDate: null,
          endDate: null,
          search: ''
        }
      });
      
      pendingRequests.clear();
      completedRequests.clear();
      
      lastLoginTime = 0;
      lastLoginEmail = null;
      loginPromise = null;
      
      const sessionKeysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.startsWith('last_login_') || key.startsWith('last_logout_'))) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
      
      const localKeysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('global_login_')) {
          localKeysToRemove.push(key);
        }
      }
      localKeysToRemove.forEach(key => localStorage.removeItem(key));
    }
  }),
  {
    name: 'log-storage',
    partialize: (state) => ({ 
      logs: state.logs.slice(0, 500),
      filters: state.filters 
    }),
  }
);

export default useLogStore;