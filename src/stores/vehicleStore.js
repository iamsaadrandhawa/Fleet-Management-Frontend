import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Logger from '../utils/logger';

// Initial vehicles data
const initialVehicles = [
  {
    id: 1,
    vehicleId: 'VH-001',
    registrationNumber: 'ABC-123',
    model: 'Camry',
    make: 'Toyota',
    year: '2023',
    color: 'White',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    status: 'Active',
    vehicleCategory: 'Car',
    assignedDriver: 'John Doe',
  },
  {
    id: 2,
    vehicleId: 'VH-002',
    registrationNumber: 'XYZ-456',
    model: 'Accord',
    make: 'Honda',
    year: '2022',
    color: 'Black',
    fuelType: 'Diesel',
    transmission: 'Automatic',
    status: 'Active',
    vehicleCategory: 'Car',
    assignedDriver: 'Jane Smith',
  },
  {
    id: 3,
    vehicleId: 'VH-003',
    registrationNumber: 'DEF-789',
    model: 'Transit',
    make: 'Ford',
    year: '2021',
    color: 'White',
    fuelType: 'Diesel',
    transmission: 'Manual',
    status: 'Active',
    vehicleCategory: 'Van',
    assignedDriver: 'Mike Johnson',
  },
];

const useVehicleStore = create(
  persist(
    (set, get) => ({
      vehicles: initialVehicles,
      isLoading: false,
      error: null,

      // Fetch vehicles - simply return the vehicles array
      fetchVehicles: () => {
        console.log('fetchVehicles called, returning:', get().vehicles);
        return get().vehicles;
      },

      // Get all vehicles
      getAllVehicles: () => {
        return get().vehicles;
      },

      // Get active vehicles only
      getActiveVehicles: () => {
        const allVehicles = get().vehicles;
        const active = allVehicles.filter(v => v.status === 'Active');
        console.log('Active vehicles:', active);
        return active;
      },

      // Add vehicle
      addVehicle: async (vehicleData) => {
        set({ isLoading: true });
        try {
          const newVehicle = {
            id: Date.now(),
            vehicleId: `VH-${String(get().vehicles.length + 1).padStart(3, '0')}`,
            ...vehicleData,
            status: 'Active',
            createdAt: new Date().toISOString(),
          };
          set(state => ({
            vehicles: [...state.vehicles, newVehicle],
            isLoading: false
          }));
          
          // ✅ Log the activity
          Logger.createVehicle(newVehicle);
          
          return { success: true, vehicle: newVehicle };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      // Update vehicle
      updateVehicle: async (id, vehicleData) => {
        set({ isLoading: true });
        try {
          // Get the vehicle before update for logging
          const oldVehicle = get().vehicles.find(vehicle => vehicle.id === id);
          
          set(state => ({
            vehicles: state.vehicles.map(vehicle =>
              vehicle.id === id ? { ...vehicle, ...vehicleData, updatedAt: new Date().toISOString() } : vehicle
            ),
            isLoading: false
          }));
          
          // ✅ Log the activity
          const updatedVehicle = { ...oldVehicle, ...vehicleData, id };
          Logger.updateVehicle(updatedVehicle);
          
          return { success: true };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false };
        }
      },

      // Delete vehicle
      deleteVehicle: async (id) => {
        set({ isLoading: true });
        try {
          // Get vehicle details before deletion for logging
          const vehicleToDelete = get().vehicles.find(vehicle => vehicle.id === id);
          
          set(state => ({
            vehicles: state.vehicles.filter(vehicle => vehicle.id !== id),
            isLoading: false
          }));
          
          // ✅ Log the activity
          if (vehicleToDelete) {
            Logger.deleteVehicle(id, vehicleToDelete.registrationNumber);
          }
          
          return { success: true };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false };
        }
      },
    }),
    {
      name: 'vehicle-storage',
    }
  )
);

export default useVehicleStore;