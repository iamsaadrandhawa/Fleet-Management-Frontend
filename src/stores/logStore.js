// stores/logStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

// Global deduplication tracking
const pendingRequests = new Map();
const completedRequests = new Map();
const requestQueue = [];

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
      // Use a combination of unique identifiers
      const timestamp = Math.floor(Date.now() / 2000); // 2 second window
      return `${logEntry.action}_${logEntry.module}_${logEntry.userEmail}_${logEntry.targetId}_${logEntry.status}_${timestamp}`;
    },

    /**
     * Check if this log is a duplicate
     */
    isDuplicate: (fingerprint) => {
      // Check pending requests
      if (pendingRequests.has(fingerprint)) {
        console.log('Duplicate prevented - request pending:', fingerprint);
        return true;
      }
      
      // Check completed requests (last 5 seconds)
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
      // Generate fingerprint
      const fingerprint = get().generateFingerprint(logEntry);
      
      // Check for duplicates
      if (get().isDuplicate(fingerprint)) {
        console.log('🚫 Duplicate log blocked:', logEntry.action, logEntry.module);
        return null;
      }
      
      // Mark as pending
      pendingRequests.set(fingerprint, Date.now());
      
      set({ isLoading: true, error: null });
      
      try {
        // Get current user
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
        
        // Enrich log data
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
        
        // Send to backend
        const response = await api.post('/audit-logs', enrichedData);
        
        const newLog = {
          id: response?.data?._id || response?._id || Date.now(),
          _id: response?.data?._id || response?._id,
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          ...enrichedData,
        };
        
        set((state) => ({
          logs: [newLog, ...state.logs],
          isLoading: false
        }));
        
        // Mark as completed
        completedRequests.set(fingerprint, Date.now());
        
        // Clean up after 5 seconds
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
     * Login log with session-based deduplication
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
      } catch (e) {}
      
      // Check session storage for recent login
      const sessionKey = `last_login_${currentUserEmail}`;
      const lastLogin = sessionStorage.getItem(sessionKey);
      
      if (lastLogin && (Date.now() - parseInt(lastLogin)) < 5000) {
        console.log('🚫 Duplicate login log prevented via session');
        return null;
      }
      
      // Store in session storage
      sessionStorage.setItem(sessionKey, Date.now().toString());
      
      // Also store in localStorage to prevent across tabs
      const globalKey = `global_login_${currentUserEmail}`;
      const lastGlobalLogin = localStorage.getItem(globalKey);
      
      if (lastGlobalLogin && (Date.now() - parseInt(lastGlobalLogin)) < 5000) {
        console.log('🚫 Duplicate login log prevented via global storage');
        return null;
      }
      
      localStorage.setItem(globalKey, Date.now().toString());
      
      // Clean up after 5 seconds
      setTimeout(() => {
        localStorage.removeItem(globalKey);
      }, 5000);
      
      return get().addLog({
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
    },

    /**
     * Logout log with deduplication
     */
    logLogout: async (userEmail = null) => {
      const sessionKey = `last_logout_${userEmail}`;
      const lastLogout = sessionStorage.getItem(sessionKey);
      
      if (lastLogout && (Date.now() - parseInt(lastLogout)) < 5000) {
        console.log('🚫 Duplicate logout log prevented');
        return null;
      }
      
      sessionStorage.setItem(sessionKey, Date.now().toString());
      
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
          } else if (Array.isArray(response)) {
            logsData = response;
            total = logsData.length;
          } else if (response.logs) {
            logsData = response.logs;
            total = response.total || logsData.length;
          }
        }
        
        const paginationData = {
          page: page,
          limit: limit,
          total: total,
          pages: Math.ceil(total / limit)
        };
        
        set((state) => ({
          logs: logsData,
          pagination: paginationData,
          filters: { ...state.filters, ...filters },
          isLoading: false,
          error: null
        }));
        
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
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete log';
        set({ 
          error: errorMessage,
          isLoading: false 
        });
        throw new Error(errorMessage);
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
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete logs';
        set({ 
          error: errorMessage,
          isLoading: false 
        });
        throw new Error(errorMessage);
      }
    },

    /**
     * Clear all logs (Admin only)
     */
    clearAllLogs: async () => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await api.delete('/audit-logs/all');
        
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
        const errorMessage = error.response?.data?.message || error.message || 'Failed to clear logs';
        set({ 
          error: errorMessage,
          isLoading: false 
        });
        throw new Error(errorMessage);
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
      
      // Clear all deduplication caches
      pendingRequests.clear();
      completedRequests.clear();
      
      // Clear session storage login tracking
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.startsWith('last_login_') || key.startsWith('last_logout_'))) {
          sessionStorage.removeItem(key);
        }
      }
      
      // Clear localStorage login tracking
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('global_login_')) {
          localStorage.removeItem(key);
        }
      }
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