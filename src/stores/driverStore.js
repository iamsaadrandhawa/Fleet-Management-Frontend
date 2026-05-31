import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Logger from '../utils/logger';
import { driverAPI } from '../services/api';

const useDriverStore = create(
  persist(
    (set, get) => ({
      // State
      drivers: [],
      isLoading: false,
      error: null,
      total: 0,
      page: 1,
      pages: 1,

      // Fetch all drivers
      fetchDrivers: async (page = 1, limit = 10, status = null) => {
        set({ isLoading: true, error: null });
        try {
          const params = { page, limit };
          if (status) params.status = status;
          
          const response = await driverAPI.getAll(params);
          
          if (response.success) {
            set({
              drivers: response.data,
              total: response.total,
              page: response.page,
              pages: response.pages,
              isLoading: false
            });
            return { success: true, data: response };
          }
        } catch (error) {
          set({ 
            error: error.message || 'Failed to fetch drivers', 
            isLoading: false 
          });
          return { success: false, error: error.message };
        }
      },

      // Add Driver
      addDriver: async (driverData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await driverAPI.create(driverData);
          
          if (response.success) {
            const newDriver = response.data;
            
            set(state => ({
              drivers: [newDriver, ...state.drivers],
              total: state.total + 1,
              isLoading: false
            }));
            
            Logger.createDriver(newDriver);
            return { success: true, driver: newDriver };
          }
        } catch (error) {
          const errorMessage = error.message || 'Failed to add driver';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      // Update Driver
      updateDriver: async (id, driverData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await driverAPI.update(id, driverData);
          
          if (response.success) {
            const updatedDriver = response.data;
            
            set(state => ({
              drivers: state.drivers.map(driver =>
                driver._id === id ? updatedDriver : driver
              ),
              isLoading: false
            }));
            
            Logger.updateDriver(updatedDriver);
            return { success: true, driver: updatedDriver };
          }
        } catch (error) {
          const errorMessage = error.message || 'Failed to update driver';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      // Update Driver Status
      updateDriverStatus: async (id, status) => {
        set({ isLoading: true, error: null });
        try {
          const response = await driverAPI.updateStatus(id, { status });
          
          if (response.success) {
            const updatedDriver = response.data;
            
            set(state => ({
              drivers: state.drivers.map(driver =>
                driver._id === id ? updatedDriver : driver
              ),
              isLoading: false
            }));
            
            Logger.updateDriverStatus(updatedDriver);
            return { success: true, driver: updatedDriver };
          }
        } catch (error) {
          const errorMessage = error.message || 'Failed to update driver status';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      // Delete Driver
      deleteDriver: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const driverToDelete = get().drivers.find(driver => driver._id === id);
          const response = await driverAPI.delete(id);
          
          if (response.success) {
            set(state => ({
              drivers: state.drivers.filter(driver => driver._id !== id),
              total: state.total - 1,
              isLoading: false
            }));
            
            if (driverToDelete) {
              Logger.deleteDriver(id, driverToDelete.fullName);
            }
            return { success: true };
          }
        } catch (error) {
          const errorMessage = error.message || 'Failed to delete driver';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      clearError: () => set({ error: null }),
      resetStore: () => set({ 
        drivers: [], 
        isLoading: false, 
        error: null, 
        total: 0, 
        page: 1, 
        pages: 1 
      })
    }),
    {
      name: 'driver-storage',
      partialize: (state) => ({
        drivers: state.drivers,
        total: state.total,
        page: state.page,
        pages: state.pages
      }),
    }
  )
);

export default useDriverStore;