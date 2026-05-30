// stores/ledgerStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Logger from '../utils/logger';
import { ledgerAPI } from '../services/api';

const useLedgerStore = create(
  persist(
    (set, get) => ({
      // State
      roles: [],
      designations: [],
      locations: [],
      makes: [],
      vehicleCategories: [],
      fuelTypes: [],
      transmissionTypes: [],
      
      isLoading: false,
      error: null,

      // ==================== INITIALIZE ALL DATA ====================
      initializeAllData: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await ledgerAPI.getAll();
          if (response.success && response.data) {
            set({
              roles: response.data.roles || [],
              designations: response.data.designations || [],
              locations: response.data.locations || [],
              makes: response.data.makes || [],
              vehicleCategories: response.data.vehicleCategories || [],
              fuelTypes: response.data.fuelTypes || [],
              transmissionTypes: response.data.transmissions || [],
              isLoading: false
            });
          }
          return { success: true };
        } catch (error) {
          set({ 
            error: error.message || 'Failed to load ledger data', 
            isLoading: false 
          });
          return { success: false, error: error.message };
        }
      },

      // ==================== ROLES ====================
      fetchRoles: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await ledgerAPI.getRoles();
          set({ 
            roles: response.data || [], 
            isLoading: false 
          });
          return { success: true, data: response.data };
        } catch (error) {
          set({ 
            error: error.message || 'Failed to fetch roles', 
            isLoading: false 
          });
          return { success: false, error: error.message };
        }
      },

      addRole: async (item) => {
        set({ isLoading: true, error: null });
        try {
          const response = await ledgerAPI.addRole({
            name: item.name,
            description: item.description,
            code: item.code,
            permissions: item.permissions || {
              create: false,
              read: false,
              update: false,
              delete: false
            },
            status: item.status || 'active'
          });
          
          const newItem = response.data;
          set(state => ({ 
            roles: [...state.roles, newItem], 
            isLoading: false 
          }));
          
          Logger.addRole?.(newItem);
          return { success: true, data: newItem };
        } catch (error) {
          set({ 
            error: error.message || 'Failed to add role', 
            isLoading: false 
          });
          return { success: false, error: error.message };
        }
      },

      updateRole: async (id, updatedData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await ledgerAPI.updateRole(id, updatedData);
          const updatedItem = response.data;
          
          set(state => ({
            roles: state.roles.map(item =>
              (item._id === id || item.id === id) ? updatedItem : item
            ),
            isLoading: false
          }));
          
          Logger.updateRole?.(updatedItem);
          return { success: true, data: updatedItem };
        } catch (error) {
          set({ 
            error: error.message || 'Failed to update role', 
            isLoading: false 
          });
          return { success: false, error: error.message };
        }
      },

      deleteRole: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const itemToDelete = get().roles.find(item => 
            item._id === id || item.id === id
          );
          
          await ledgerAPI.deleteRole(id);
          
          set(state => ({
            roles: state.roles.filter(item => 
              (item._id !== id && item.id !== id)
            ),
            isLoading: false
          }));
          
          if (itemToDelete) {
            Logger.deleteRole?.(id, itemToDelete.name);
          }
          return { success: true };
        } catch (error) {
          set({ 
            error: error.message || 'Failed to delete role', 
            isLoading: false 
          });
          return { success: false, error: error.message };
        }
      },

      // ==================== DESIGNATIONS ====================
      fetchDesignations: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await ledgerAPI.getDesignations();
          set({ 
            designations: response.data || [], 
            isLoading: false 
          });
          return { success: true, data: response.data };
        } catch (error) {
          set({ 
            error: error.message || 'Failed to fetch designations', 
            isLoading: false 
          });
          return { success: false, error: error.message };
        }
      },

      addDesignation: async (item) => {
        set({ isLoading: true, error: null });
        try {
          const response = await ledgerAPI.addDesignation({
            name: item.name,
            description: item.description,
            code: item.code
          });
          
          const newItem = response.data;
          set(state => ({ 
            designations: [...state.designations, newItem],
            isLoading: false 
          }));
          
          Logger.addDesignation?.(newItem);
          return { success: true, data: newItem };
        } catch (error) {
          set({ 
            error: error.message || 'Failed to add designation', 
            isLoading: false 
          });
          return { success: false, error: error.message };
        }
      },

      updateDesignation: async (id, updatedData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await ledgerAPI.updateDesignation(id, updatedData);
          const updatedItem = response.data;
          
          set(state => ({
            designations: state.designations.map(item =>
              (item._id === id || item.id === id) ? updatedItem : item
            ),
            isLoading: false
          }));
          
          Logger.updateDesignation?.(updatedItem);
          return { success: true, data: updatedItem };
        } catch (error) {
          set({ 
            error: error.message || 'Failed to update designation', 
            isLoading: false 
          });
          return { success: false, error: error.message };
        }
      },

      deleteDesignation: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const itemToDelete = get().designations.find(item => 
            item._id === id || item.id === id
          );
          
          await ledgerAPI.deleteDesignation(id);
          
          set(state => ({
            designations: state.designations.filter(item => 
              (item._id !== id && item.id !== id)
            ),
            isLoading: false
          }));
          
          if (itemToDelete) {
            Logger.deleteDesignation?.(id, itemToDelete.name);
          }
          return { success: true };
        } catch (error) {
          set({ 
            error: error.message || 'Failed to delete designation', 
            isLoading: false 
          });
          return { success: false, error: error.message };
        }
      },

      // ==================== LOCATIONS ====================
      fetchLocations: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await ledgerAPI.getLocations();
          set({ locations: response.data || [], isLoading: false });
          return { success: true, data: response.data };
        } catch (error) {
          set({ error: error.message || 'Failed to fetch locations', isLoading: false });
          return { success: false, error: error.message };
        }
      },

      addLocation: async (item) => {
        set({ isLoading: true, error: null });
        try {
          const response = await ledgerAPI.addLocation({
            name: item.name,
            address: item.address,
            city: item.city,
            code: item.code
          });
          
          const newItem = response.data;
          set(state => ({ locations: [...state.locations, newItem], isLoading: false }));
          Logger.addLocation?.(newItem);
          return { success: true, data: newItem };
        } catch (error) {
          set({ error: error.message || 'Failed to add location', isLoading: false });
          return { success: false, error: error.message };
        }
      },

      updateLocation: async (id, updatedData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await ledgerAPI.updateLocation(id, updatedData);
          const updatedItem = response.data;
          
          set(state => ({
            locations: state.locations.map(item =>
              (item._id === id || item.id === id) ? updatedItem : item
            ),
            isLoading: false
          }));
          
          Logger.updateLocation?.(updatedItem);
          return { success: true, data: updatedItem };
        } catch (error) {
          set({ error: error.message || 'Failed to update location', isLoading: false });
          return { success: false, error: error.message };
        }
      },

      deleteLocation: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const itemToDelete = get().locations.find(item => item._id === id || item.id === id);
          await ledgerAPI.deleteLocation(id);
          
          set(state => ({
            locations: state.locations.filter(item => (item._id !== id && item.id !== id)),
            isLoading: false
          }));
          
          if (itemToDelete) Logger.deleteLocation?.(id, itemToDelete.name);
          return { success: true };
        } catch (error) {
          set({ error: error.message || 'Failed to delete location', isLoading: false });
          return { success: false, error: error.message };
        }
      },

      // ==================== MAKES ====================
      fetchMakes: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await ledgerAPI.getMakes();
          set({ makes: response.data || [], isLoading: false });
          return { success: true, data: response.data };
        } catch (error) {
          set({ error: error.message || 'Failed to fetch makes', isLoading: false });
          return { success: false, error: error.message };
        }
      },

      addMake: async (item) => {
        set({ isLoading: true, error: null });
        try {
          const response = await ledgerAPI.addMake({
            name: item.name,
            country: item.country,
            code: item.code
          });
          
          const newItem = response.data;
          set(state => ({ makes: [...state.makes, newItem], isLoading: false }));
          Logger.addMake?.(newItem);
          return { success: true, data: newItem };
        } catch (error) {
          set({ error: error.message || 'Failed to add make', isLoading: false });
          return { success: false, error: error.message };
        }
      },

      updateMake: async (id, updatedData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await ledgerAPI.updateMake(id, updatedData);
          const updatedItem = response.data;
          
          set(state => ({
            makes: state.makes.map(item => (item._id === id || item.id === id) ? updatedItem : item),
            isLoading: false
          }));
          
          Logger.updateMake?.(updatedItem);
          return { success: true, data: updatedItem };
        } catch (error) {
          set({ error: error.message || 'Failed to update make', isLoading: false });
          return { success: false, error: error.message };
        }
      },

      deleteMake: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const itemToDelete = get().makes.find(item => item._id === id || item.id === id);
          await ledgerAPI.deleteMake(id);
          
          set(state => ({
            makes: state.makes.filter(item => (item._id !== id && item.id !== id)),
            isLoading: false
          }));
          
          if (itemToDelete) Logger.deleteMake?.(id, itemToDelete.name);
          return { success: true };
        } catch (error) {
          set({ error: error.message || 'Failed to delete make', isLoading: false });
          return { success: false, error: error.message };
        }
      },

      // ==================== VEHICLE CATEGORIES ====================
      fetchVehicleCategories: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await ledgerAPI.getVehicleCategories();
          set({ vehicleCategories: response.data || [], isLoading: false });
          return { success: true, data: response.data };
        } catch (error) {
          set({ error: error.message || 'Failed to fetch vehicle categories', isLoading: false });
          return { success: false, error: error.message };
        }
      },

      addVehicleCategory: async (item) => {
        set({ isLoading: true, error: null });
        try {
          const response = await ledgerAPI.addVehicleCategory({
            name: item.name,
            description: item.description,
            code: item.code
          });
          
          const newItem = response.data;
          set(state => ({ vehicleCategories: [...state.vehicleCategories, newItem], isLoading: false }));
          Logger.addVehicleCategory?.(newItem);
          return { success: true, data: newItem };
        } catch (error) {
          set({ error: error.message || 'Failed to add vehicle category', isLoading: false });
          return { success: false, error: error.message };
        }
      },

      updateVehicleCategory: async (id, updatedData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await ledgerAPI.updateVehicleCategory(id, updatedData);
          const updatedItem = response.data;
          
          set(state => ({
            vehicleCategories: state.vehicleCategories.map(item => 
              (item._id === id || item.id === id) ? updatedItem : item
            ),
            isLoading: false
          }));
          
          Logger.updateVehicleCategory?.(updatedItem);
          return { success: true, data: updatedItem };
        } catch (error) {
          set({ error: error.message || 'Failed to update vehicle category', isLoading: false });
          return { success: false, error: error.message };
        }
      },

      deleteVehicleCategory: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const itemToDelete = get().vehicleCategories.find(item => item._id === id || item.id === id);
          await ledgerAPI.deleteVehicleCategory(id);
          
          set(state => ({
            vehicleCategories: state.vehicleCategories.filter(item => (item._id !== id && item.id !== id)),
            isLoading: false
          }));
          
          if (itemToDelete) Logger.deleteVehicleCategory?.(id, itemToDelete.name);
          return { success: true };
        } catch (error) {
          set({ error: error.message || 'Failed to delete vehicle category', isLoading: false });
          return { success: false, error: error.message };
        }
      },

      // ==================== FUEL TYPES ====================
      fetchFuelTypes: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await ledgerAPI.getFuelTypes();
          set({ fuelTypes: response.data || [], isLoading: false });
          return { success: true, data: response.data };
        } catch (error) {
          set({ error: error.message || 'Failed to fetch fuel types', isLoading: false });
          return { success: false, error: error.message };
        }
      },

      addFuelType: async (item) => {
        set({ isLoading: true, error: null });
        try {
          const response = await ledgerAPI.addFuelType({ name: item.name, code: item.code });
          const newItem = response.data;
          set(state => ({ fuelTypes: [...state.fuelTypes, newItem], isLoading: false }));
          Logger.addFuelType?.(newItem);
          return { success: true, data: newItem };
        } catch (error) {
          set({ error: error.message || 'Failed to add fuel type', isLoading: false });
          return { success: false, error: error.message };
        }
      },

      updateFuelType: async (id, updatedData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await ledgerAPI.updateFuelType(id, updatedData);
          const updatedItem = response.data;
          
          set(state => ({
            fuelTypes: state.fuelTypes.map(item => (item._id === id || item.id === id) ? updatedItem : item),
            isLoading: false
          }));
          
          Logger.updateFuelType?.(updatedItem);
          return { success: true, data: updatedItem };
        } catch (error) {
          set({ error: error.message || 'Failed to update fuel type', isLoading: false });
          return { success: false, error: error.message };
        }
      },

      deleteFuelType: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const itemToDelete = get().fuelTypes.find(item => item._id === id || item.id === id);
          await ledgerAPI.deleteFuelType(id);
          
          set(state => ({
            fuelTypes: state.fuelTypes.filter(item => (item._id !== id && item.id !== id)),
            isLoading: false
          }));
          
          if (itemToDelete) Logger.deleteFuelType?.(id, itemToDelete.name);
          return { success: true };
        } catch (error) {
          set({ error: error.message || 'Failed to delete fuel type', isLoading: false });
          return { success: false, error: error.message };
        }
      },

      // ==================== TRANSMISSIONS ====================
      fetchTransmissions: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await ledgerAPI.getTransmissions();
          set({ transmissionTypes: response.data || [], isLoading: false });
          return { success: true, data: response.data };
        } catch (error) {
          set({ error: error.message || 'Failed to fetch transmissions', isLoading: false });
          return { success: false, error: error.message };
        }
      },

      addTransmission: async (item) => {
        set({ isLoading: true, error: null });
        try {
          const response = await ledgerAPI.addTransmission({ name: item.name, code: item.code });
          const newItem = response.data;
          set(state => ({ transmissionTypes: [...state.transmissionTypes, newItem], isLoading: false }));
          Logger.addTransmission?.(newItem);
          return { success: true, data: newItem };
        } catch (error) {
          set({ error: error.message || 'Failed to add transmission', isLoading: false });
          return { success: false, error: error.message };
        }
      },

      updateTransmission: async (id, updatedData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await ledgerAPI.updateTransmission(id, updatedData);
          const updatedItem = response.data;
          
          set(state => ({
            transmissionTypes: state.transmissionTypes.map(item => 
              (item._id === id || item.id === id) ? updatedItem : item
            ),
            isLoading: false
          }));
          
          Logger.updateTransmission?.(updatedItem);
          return { success: true, data: updatedItem };
        } catch (error) {
          set({ error: error.message || 'Failed to update transmission', isLoading: false });
          return { success: false, error: error.message };
        }
      },

      deleteTransmission: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const itemToDelete = get().transmissionTypes.find(item => item._id === id || item.id === id);
          await ledgerAPI.deleteTransmission(id);
          
          set(state => ({
            transmissionTypes: state.transmissionTypes.filter(item => (item._id !== id && item.id !== id)),
            isLoading: false
          }));
          
          if (itemToDelete) Logger.deleteTransmission?.(id, itemToDelete.name);
          return { success: true };
        } catch (error) {
          set({ error: error.message || 'Failed to delete transmission', isLoading: false });
          return { success: false, error: error.message };
        }
      },

      // ==================== HELPER FUNCTIONS ====================
      getActiveRoles: () => get().roles.filter(r => r.status === 'active'),
      getActiveDesignations: () => get().designations.filter(d => d.status === 'active'),
      getActiveLocations: () => get().locations.filter(l => l.status === 'active'),
      getActiveMakes: () => get().makes.filter(m => m.status === 'active'),
      getActiveVehicleCategories: () => get().vehicleCategories.filter(c => c.status === 'active'),
      getActiveFuelTypes: () => get().fuelTypes.filter(f => f.status === 'active'),
      getActiveTransmissionTypes: () => get().transmissionTypes.filter(t => t.status === 'active'),

      clearError: () => set({ error: null }),
      
      reset: () => set({
        roles: [],
        designations: [],
        locations: [],
        makes: [],
        vehicleCategories: [],
        fuelTypes: [],
        transmissionTypes: [],
        isLoading: false,
        error: null
      })
    }),
    {
      name: 'ledger-storage',
      partialize: (state) => ({
        // Don't persist any data to ensure fresh data on each load
      })
    }
  )
);

export default useLedgerStore;