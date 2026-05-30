import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Logger from '../utils/logger';
import { vehicleAPI } from '../services/api';

const useVehicleStore = create(
  persist(
    (set, get) => ({
      vehicles: [],
      isLoading: false,
      error: null,

      // Fetch vehicles - NO LOADING STATE, immediate data
      fetchVehicles: async () => {
        // Don't set loading - just fetch
        try {
          const response = await vehicleAPI.getAll();
          const vehiclesData = response.data || response;
          set({ vehicles: vehiclesData, error: null });
          console.log('Vehicles fetched:', vehiclesData.length);
          return vehiclesData;
        } catch (error) {
          console.error('Fetch vehicles error:', error);
          set({ error: error.message || 'Failed to fetch vehicles' });
          return [];
        }
      },

      // Get all vehicles (from store)
      getAllVehicles: () => {
        return get().vehicles;
      },

      // Get active vehicles only
      getActiveVehicles: () => {
        const allVehicles = get().vehicles;
        const active = allVehicles.filter(v => v.status === 'active');
        return active;
      },

      // Get vehicle by ID - NO LOADING
      getVehicleById: async (id) => {
        try {
          const response = await vehicleAPI.getById(id);
          const vehicle = response.data || response;
          return { success: true, data: vehicle };
        } catch (error) {
          console.error('Get vehicle error:', error);
          set({ error: error.message || 'Failed to fetch vehicle' });
          return { success: false, error: error.message };
        }
      },

      // Add vehicle - NO LOADING
      addVehicle: async (vehicleData) => {
        try {
          const response = await vehicleAPI.create(vehicleData);
          const newVehicle = response.data || response;
          
          // Update store instantly
          set(state => ({
            vehicles: [...state.vehicles, newVehicle],
            error: null
          }));
          
          Logger.createVehicle(newVehicle);
          return { success: true, vehicle: newVehicle };
        } catch (error) {
          console.error('Add vehicle error:', error);
          set({ error: error.message || 'Failed to add vehicle' });
          return { success: false, error: error.message };
        }
      },

      // Update vehicle - NO LOADING
      updateVehicle: async (id, vehicleData) => {
        try {
          const oldVehicle = get().vehicles.find(vehicle => vehicle._id === id || vehicle.id === id);
          
          // Optimistic update - update UI immediately
          set(state => ({
            vehicles: state.vehicles.map(vehicle =>
              (vehicle._id === id || vehicle.id === id) 
                ? { ...vehicle, ...vehicleData, updatedAt: new Date().toISOString() }
                : vehicle
            ),
            error: null
          }));
          
          // Then make API call
          const response = await vehicleAPI.update(id, vehicleData);
          const updatedVehicle = response.data || response;
          
          // Sync with actual API response
          set(state => ({
            vehicles: state.vehicles.map(vehicle =>
              (vehicle._id === id || vehicle.id === id) 
                ? updatedVehicle 
                : vehicle
            )
          }));
          
          Logger.updateVehicle(updatedVehicle);
          return { success: true, vehicle: updatedVehicle };
        } catch (error) {
          console.error('Update vehicle error:', error);
          // Rollback on error
          await get().fetchVehicles();
          set({ error: error.message || 'Failed to update vehicle' });
          return { success: false, error: error.message };
        }
      },

      // Delete vehicle - NO LOADING
      deleteVehicle: async (id) => {
        try {
          const vehicleToDelete = get().vehicles.find(
            vehicle => vehicle._id === id || vehicle.id === id
          );
          
          // Optimistic delete - remove immediately
          set(state => ({
            vehicles: state.vehicles.filter(
              vehicle => (vehicle._id !== id && vehicle.id !== id)
            ),
            error: null
          }));
          
          // Then make API call
          await vehicleAPI.delete(id);
          
          if (vehicleToDelete) {
            Logger.deleteVehicle(id, vehicleToDelete.registrationNumber || vehicleToDelete.vehicleNumber);
          }
          
          return { success: true };
        } catch (error) {
          console.error('Delete vehicle error:', error);
          // Rollback - refetch on error
          await get().fetchVehicles();
          set({ error: error.message || 'Failed to delete vehicle' });
          return { success: false, error: error.message };
        }
      },

      // Assign vehicle to driver - NO LOADING
      assignVehicle: async (id, driverId) => {
        try {
          // Optimistic update
          set(state => ({
            vehicles: state.vehicles.map(vehicle =>
              (vehicle._id === id || vehicle.id === id) 
                ? { ...vehicle, assignedTo: driverId, status: 'assigned' }
                : vehicle
            ),
            error: null
          }));
          
          const response = await vehicleAPI.assignToDriver(id, { driverId });
          const updatedVehicle = response.data || response;
          
          // Sync with actual response
          set(state => ({
            vehicles: state.vehicles.map(vehicle =>
              (vehicle._id === id || vehicle.id === id) 
                ? updatedVehicle 
                : vehicle
            )
          }));
          
          return { success: true, vehicle: updatedVehicle };
        } catch (error) {
          console.error('Assign vehicle error:', error);
          await get().fetchVehicles();
          set({ error: error.message || 'Failed to assign vehicle' });
          return { success: false, error: error.message };
        }
      },

      // Unassign vehicle - NO LOADING
      unassignVehicle: async (id) => {
        try {
          // Optimistic update
          set(state => ({
            vehicles: state.vehicles.map(vehicle =>
              (vehicle._id === id || vehicle.id === id) 
                ? { ...vehicle, assignedTo: null, status: 'active' }
                : vehicle
            ),
            error: null
          }));
          
          const response = await vehicleAPI.unassignFromDriver(id);
          const updatedVehicle = response.data || response;
          
          // Sync with actual response
          set(state => ({
            vehicles: state.vehicles.map(vehicle =>
              (vehicle._id === id || vehicle.id === id) 
                ? updatedVehicle 
                : vehicle
            )
          }));
          
          return { success: true, vehicle: updatedVehicle };
        } catch (error) {
          console.error('Unassign vehicle error:', error);
          await get().fetchVehicles();
          set({ error: error.message || 'Failed to unassign vehicle' });
          return { success: false, error: error.message };
        }
      },

      // Pre-fetch vehicles (call this once when app loads)
      preFetchVehicles: async () => {
        const vehicles = get().vehicles;
        // Only fetch if no vehicles in store
        if (vehicles.length === 0) {
          try {
            const response = await vehicleAPI.getAll();
            const vehiclesData = response.data || response;
            set({ vehicles: vehiclesData });
          } catch (error) {
            console.error('Pre-fetch error:', error);
          }
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'vehicle-storage',
      partialize: (state) => ({
        vehicles: state.vehicles, // Persist vehicles in localStorage
      }),
    }
  )
);

export default useVehicleStore;