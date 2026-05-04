import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Logger from '../utils/logger';

const useDriverStore = create(
  persist(
    (set, get) => ({
      // State
      drivers: [
        { 
          id: 1,
          employeeId: 'EMP-001',
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          cnic: '12345-1234567-1',
          phoneNumber: '+92 300 1234567',
          email: 'john.doe@fleet.com',
          designation: 'Senior Driver',
          location: 'Karachi, Pakistan',
          allocatedVehicle: 'Toyota Camry (ABC-123)',
          dateOfAllotment: '2024-01-15',
          status: 'Active',
          joiningDate: '2023-06-01',
          licenseNumber: 'DL-12345',
          licenseExpiry: '2025-06-01',
        },
      ],
      isLoading: false,
      error: null,

      // Fetch function
      fetchDrivers: async () => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 500));
        set({ isLoading: false });
        return get().drivers;
      },

      // Add Driver function
      addDriver: async (driverData) => {
        set({ isLoading: true });
        try {
          const newDriver = {
            id: Date.now(),
            ...driverData,
            createdAt: new Date().toISOString(),
          };
          set(state => ({
            drivers: [newDriver, ...state.drivers],
            isLoading: false
          }));
          
          // ✅ Log the activity
          Logger.createDriver(newDriver);
          
          return { success: true, driver: newDriver };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      updateDriver: async (id, driverData) => {
        set({ isLoading: true });
        try {
          // Get the driver before update for logging
          const oldDriver = get().drivers.find(driver => driver.id === id);
          
          set(state => ({
            drivers: state.drivers.map(driver =>
              driver.id === id ? { ...driver, ...driverData, updatedAt: new Date().toISOString() } : driver
            ),
            isLoading: false
          }));
          
          // ✅ Log the activity
          const updatedDriver = { ...oldDriver, ...driverData, id };
          Logger.updateDriver(updatedDriver);
          
          return { success: true };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false };
        }
      },

      deleteDriver: async (id) => {
        set({ isLoading: true });
        try {
          // Get driver details before deletion for logging
          const driverToDelete = get().drivers.find(driver => driver.id === id);
          
          set(state => ({
            drivers: state.drivers.filter(driver => driver.id !== id),
            isLoading: false
          }));
          
          // ✅ Log the activity
          if (driverToDelete) {
            Logger.deleteDriver(id, driverToDelete.fullName);
          }
          
          return { success: true };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false };
        }
      },
    }),
    {
      name: 'driver-storage',
    }
  )
);

export default useDriverStore;