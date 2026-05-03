import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Sample initial logs for demo purposes
const initialLogs = [
  {
    id: 1,
    timestamp: '2024-01-15T10:30:00.000Z',
    formattedTime: '2024-01-15 10:30 AM',
    action: 'CREATE',
    entityType: 'DRIVER',
    entityId: 101,
    details: { name: 'John Doe', employeeId: 'EMP-001', phone: '+92 300 1234567' },
    userId: 1,
    userName: 'Super Admin',
    userEmail: 'superadmin@fleet.com',
    userRole: 'Super Admin',
  },
  {
    id: 2,
    timestamp: '2024-01-15T09:15:00.000Z',
    formattedTime: '2024-01-15 09:15 AM',
    action: 'CREATE',
    entityType: 'VEHICLE',
    entityId: 201,
    details: { make: 'Toyota', model: 'Camry', registrationNumber: 'ABC-123', year: 2023 },
    userId: 2,
    userName: 'Admin User',
    userEmail: 'admin@fleet.com',
    userRole: 'Admin',
  },
  {
    id: 3,
    timestamp: '2024-01-14T16:45:00.000Z',
    formattedTime: '2024-01-14 04:45 PM',
    action: 'UPDATE',
    entityType: 'DRIVER',
    entityId: 102,
    details: { name: 'Jane Smith', phone: '+92 300 7654321' },
    userId: 3,
    userName: 'Fleet Manager',
    userEmail: 'manager@fleet.com',
    userRole: 'Manager',
  },
  {
    id: 4,
    timestamp: '2024-01-14T14:20:00.000Z',
    formattedTime: '2024-01-14 02:20 PM',
    action: 'DELETE',
    entityType: 'VEHICLE',
    entityId: 202,
    details: { registrationNumber: 'XYZ-789', make: 'Ford', model: 'Old Model' },
    userId: 4,
    userName: 'Data Entry Staff',
    userEmail: 'staff@fleet.com',
    userRole: 'Staff',
  },
  {
    id: 5,
    timestamp: '2024-01-14T11:00:00.000Z',
    formattedTime: '2024-01-14 11:00 AM',
    action: 'VIEW',
    entityType: 'DRIVER',
    entityId: 103,
    details: { name: 'Mike Johnson' },
    userId: 5,
    userName: 'Audit Viewer',
    userEmail: 'viewer@fleet.com',
    userRole: 'Viewer',
  },
  {
    id: 6,
    timestamp: '2024-01-13T15:30:00.000Z',
    formattedTime: '2024-01-13 03:30 PM',
    action: 'CREATE',
    entityType: 'DRIVER',
    entityId: 104,
    details: { name: 'Sarah Williams', employeeId: 'EMP-004', phone: '+92 300 5555555' },
    userId: 1,
    userName: 'Super Admin',
    userEmail: 'superadmin@fleet.com',
    userRole: 'Super Admin',
  },
  {
    id: 7,
    timestamp: '2024-01-13T10:00:00.000Z',
    formattedTime: '2024-01-13 10:00 AM',
    action: 'UPDATE',
    entityType: 'VEHICLE',
    entityId: 203,
    details: { status: 'Maintenance', registrationNumber: 'DEF-456' },
    userId: 3,
    userName: 'Fleet Manager',
    userEmail: 'manager@fleet.com',
    userRole: 'Manager',
  },
  {
    id: 8,
    timestamp: '2024-01-12T09:00:00.000Z',
    formattedTime: '2024-01-12 09:00 AM',
    action: 'LOGIN',
    entityType: 'AUTH',
    entityId: 1,
    details: { email: 'superadmin@fleet.com', name: 'Super Admin' },
    userId: 1,
    userName: 'Super Admin',
    userEmail: 'superadmin@fleet.com',
    userRole: 'Super Admin',
  },
  {
    id: 9,
    timestamp: '2024-01-11T18:30:00.000Z',
    formattedTime: '2024-01-11 06:30 PM',
    action: 'LOGOUT',
    entityType: 'AUTH',
    entityId: 2,
    details: { email: 'admin@fleet.com', name: 'Admin User' },
    userId: 2,
    userName: 'Admin User',
    userEmail: 'admin@fleet.com',
    userRole: 'Admin',
  },
  {
    id: 10,
    timestamp: '2024-01-11T14:00:00.000Z',
    formattedTime: '2024-01-11 02:00 PM',
    action: 'CREATE',
    entityType: 'DESIGNATION',
    entityId: 7,
    details: { name: 'Senior Dispatcher', code: 'SR-DIS', description: 'Senior dispatcher role' },
    userId: 1,
    userName: 'Super Admin',
    userEmail: 'superadmin@fleet.com',
    userRole: 'Super Admin',
  },
];

const useLogStore = create(
  persist(
    (set, get) => ({
      // State
      logs: initialLogs, // Initialize with sample logs
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
        // For now, using mock implementation
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
        
        // Mock implementation
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
        // TODO: Replace with API call
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
        // TODO: Add API call
        // await api.delete('/logs');
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
        // TODO: Add API call
        // await api.delete(`/logs/${id}`);
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