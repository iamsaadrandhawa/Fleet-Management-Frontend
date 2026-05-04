import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useLogStore = create(
  persist(
    (set, get) => ({
      // State
      logs: [], // Start with empty logs
      isLoading: false,
      error: null,

      // ==================== API INTEGRATION NOTES ====================
      // TODO: Replace mock implementation with actual API calls
      // API Endpoints to implement:
      // - GET /api/logs - Fetch all logs with pagination
      // - POST /api/logs - Create new log entry
      // - DELETE /api/logs/:id - Delete specific log
      // - DELETE /api/logs - Clear all logs (admin only)
      // - GET /api/logs/filter - Get logs with filters (by user, action, entity, date range)
      // ================================================================

      /**
       * Add a new log entry
       * @param {Object} logEntry - The log entry to add
       * @returns {Object} The created log entry
       * 
       * API Implementation:
       * const response = await api.post('/logs', logEntry);
       * return response.data;
       */
      addLog: (logEntry) => {
        const newLog = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          formattedTime: new Date().toLocaleString(),
          ...logEntry,
        };
        
        set((state) => ({
          logs: [newLog, ...state.logs],
        }));
        
        // TODO: Uncomment when API is ready
        // try {
        //   const response = await api.post('/logs', newLog);
        //   return response.data;
        // } catch (error) {
        //   console.error('Failed to save log to server:', error);
        //   // Still save locally even if API fails
        //   return newLog;
        // }
        
        return newLog;
      },

      /**
       * Fetch all logs from server
       * @returns {Array} List of all logs
       * 
       * API Implementation:
       * const response = await api.get('/logs');
       * set({ logs: response.data });
       * return response.data;
       */
      fetchAllLogs: async () => {
        set({ isLoading: true });
        
        // TODO: Uncomment when API is ready
        // try {
        //   const response = await api.get('/logs');
        //   set({ logs: response.data, isLoading: false });
        //   return response.data;
        // } catch (error) {
        //   set({ error: error.message, isLoading: false });
        //   return [];
        // }
        
        // Mock implementation (remove delay if not needed)
        await new Promise(resolve => setTimeout(resolve, 500));
        set({ isLoading: false });
        return get().logs;
      },

      /**
       * Get all logs (from local state)
       * @returns {Array} List of all logs
       */
      getAllLogs: () => get().logs,

      /**
       * Get logs by user ID
       * @param {number} userId - The user ID to filter by
       * @returns {Array} Filtered logs
       * 
       * API Implementation:
       * const response = await api.get(`/logs/user/${userId}`);
       * return response.data;
       */
      getLogsByUser: (userId) => {
        return get().logs.filter(log => log.userId === userId);
      },

      /**
       * Get logs by user email
       * @param {string} email - The user email to filter by
       * @returns {Array} Filtered logs
       */
      getLogsByUserEmail: (email) => {
        return get().logs.filter(log => log.userEmail === email);
      },

      /**
       * Get logs by action type
       * @param {string} action - The action type (CREATE, UPDATE, DELETE, VIEW, LOGIN, LOGOUT)
       * @returns {Array} Filtered logs
       * 
       * API Implementation:
       * const response = await api.get(`/logs/action/${action}`);
       * return response.data;
       */
      getLogsByAction: (action) => {
        return get().logs.filter(log => log.action === action);
      },

      /**
       * Get logs by entity type
       * @param {string} entityType - The entity type (DRIVER, VEHICLE, USER, etc.)
       * @returns {Array} Filtered logs
       * 
       * API Implementation:
       * const response = await api.get(`/logs/entity/${entityType}`);
       * return response.data;
       */
      getLogsByEntity: (entityType) => {
        return get().logs.filter(log => log.entityType === entityType);
      },

      /**
       * Get logs by date range
       * @param {Date} startDate - Start date for filtering
       * @param {Date} endDate - End date for filtering
       * @returns {Array} Filtered logs within date range
       * 
       * API Implementation:
       * const response = await api.get(`/logs/date-range?start=${startDate}&end=${endDate}`);
       * return response.data;
       */
      getLogsByDateRange: (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return get().logs.filter(log => {
          const logDate = new Date(log.timestamp);
          return logDate >= start && logDate <= end;
        });
      },

      /**
       * Get recent logs with limit
       * @param {number} limit - Maximum number of logs to return (default: 50)
       * @returns {Array} Recent logs
       * 
       * API Implementation:
       * const response = await api.get(`/logs/recent?limit=${limit}`);
       * return response.data;
       */
      getRecentLogs: (limit = 50) => {
        return get().logs.slice(0, limit);
      },

      /**
       * Get paginated logs
       * @param {number} page - Page number (starting from 1)
       * @param {number} limit - Items per page (default: 20)
       * @returns {Object} Paginated logs with metadata
       * 
       * API Implementation:
       * const response = await api.get(`/logs?page=${page}&limit=${limit}`);
       * return response.data;
       */
      getPaginatedLogs: (page = 1, limit = 20) => {
        const logs = get().logs;
        const start = (page - 1) * limit;
        const end = start + limit;
        return {
          data: logs.slice(start, end),
          total: logs.length,
          page,
          totalPages: Math.ceil(logs.length / limit),
        };
      },

      /**
       * Clear all logs (Admin only)
       * @returns {boolean} Success status
       * 
       * API Implementation:
       * await api.delete('/logs');
       * set({ logs: [] });
       */
      clearAllLogs: () => {
        set({ logs: [] });
      },

      /**
       * Delete log by ID (Admin only)
       * @param {number} id - The log ID to delete
       * @returns {boolean} Success status
       * 
       * API Implementation:
       * await api.delete(`/logs/${id}`);
       */
      deleteLog: (id) => {
        set((state) => ({
          logs: state.logs.filter(log => log.id !== id),
        }));
      },

      /**
       * Get logs count by action type
       * @returns {Object} Object with action types as keys and counts as values
       */
      getLogsCountByAction: () => {
        const counts = {};
        get().logs.forEach(log => {
          counts[log.action] = (counts[log.action] || 0) + 1;
        });
        return counts;
      },

      /**
       * Get logs statistics
       * @returns {Object} Statistics about logs
       */
      getLogsStats: () => {
        const logs = get().logs;
        return {
          total: logs.length,
          byAction: get().getLogsCountByAction(),
          byEntity: logs.reduce((acc, log) => {
            acc[log.entityType] = (acc[log.entityType] || 0) + 1;
            return acc;
          }, {}),
          last7Days: logs.filter(log => {
            const logDate = new Date(log.timestamp);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return logDate >= sevenDaysAgo;
          }).length,
        };
      },
    }),
    {
      name: 'log-storage',
      // Keep only last 500 logs to avoid storage issues
      partialize: (state) => ({ logs: state.logs.slice(0, 500) }),
    }
  )
);

export default useLogStore;