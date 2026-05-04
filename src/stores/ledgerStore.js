import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Logger from '../utils/logger';

const useLedgerStore = create(
  persist(
    (set, get) => ({
      // ==================== DESIGNATIONS ====================
      designations: [
        { id: 1, name: 'Senior Driver', code: 'SR-DRV', description: 'Experienced driver with 5+ years', status: 'Active', count: 12 },
        { id: 2, name: 'Junior Driver', code: 'JR-DRV', description: 'Entry level driver', status: 'Active', count: 8 },
        { id: 3, name: 'Heavy Vehicle Driver', code: 'HV-DRV', description: 'Licensed for heavy trucks', status: 'Active', count: 6 },
        { id: 4, name: 'Light Vehicle Driver', code: 'LV-DRV', description: 'Licensed for cars and vans', status: 'Active', count: 15 },
        { id: 5, name: 'Bus Driver', code: 'BUS-DRV', description: 'Licensed for passenger buses', status: 'Active', count: 4 },
        { id: 6, name: 'Truck Driver', code: 'TRK-DRV', description: 'Long route truck driver', status: 'Inactive', count: 3 },
      ],

      // ==================== LOCATIONS ====================
      locations: [
        { id: 1, name: 'Karachi', code: 'KHI', description: 'Southern region HQ', status: 'Active' },
        { id: 2, name: 'Lahore', code: 'LHE', description: 'Central region HQ', status: 'Active' },
        { id: 3, name: 'Islamabad', code: 'ISB', description: 'Northern region HQ', status: 'Active' },
        { id: 4, name: 'Rawalpindi', code: 'RWP', description: 'Twin cities depot', status: 'Active' },
        { id: 5, name: 'Peshawar', code: 'PSH', description: 'Western region depot', status: 'Active' },
      ],

      // ==================== VEHICLE MAKES ====================
      makes: [
        { id: 1, name: 'Toyota', code: 'TYT', description: 'Japanese automaker', status: 'Active' },
        { id: 2, name: 'Honda', code: 'HND', description: 'Japanese automaker', status: 'Active' },
        { id: 3, name: 'Ford', code: 'FRD', description: 'American automaker', status: 'Active' },
        { id: 4, name: 'Chevrolet', code: 'CHV', description: 'American automaker', status: 'Active' },
        { id: 5, name: 'Nissan', code: 'NSN', description: 'Japanese automaker', status: 'Active' },
        { id: 6, name: 'Suzuki', code: 'SUZ', description: 'Japanese automaker', status: 'Active' },
        { id: 7, name: 'Hyundai', code: 'HYD', description: 'Korean automaker', status: 'Active' },
        { id: 8, name: 'Kia', code: 'KIA', description: 'Korean automaker', status: 'Active' },
      ],

      // ==================== VEHICLE CATEGORIES ====================
      vehicleCategories: [
        { id: 1, name: 'Car', code: 'CAR', description: 'Passenger cars', status: 'Active', count: 0 },
        { id: 2, name: 'Truck', code: 'TRK', description: 'Heavy cargo trucks', status: 'Active', count: 0 },
        { id: 3, name: 'Van', code: 'VAN', description: 'Medium cargo vans', status: 'Active', count: 0 },
        { id: 4, name: 'Bus', code: 'BUS', description: 'Passenger buses', status: 'Active', count: 0 },
        { id: 5, name: 'Motorcycle', code: 'MC', description: 'Two-wheelers', status: 'Active', count: 0 },
        { id: 6, name: 'Forklift', code: 'FKL', description: 'Warehouse vehicles', status: 'Active', count: 0 },
      ],

      // ==================== FUEL TYPES ====================
      fuelTypes: [
        { id: 1, name: 'Petrol', code: 'PTL', description: 'Regular gasoline', status: 'Active' },
        { id: 2, name: 'Diesel', code: 'DSL', description: 'Diesel fuel', status: 'Active' },
        { id: 3, name: 'Electric', code: 'ELE', description: 'Electric battery', status: 'Active' },
        { id: 4, name: 'Hybrid', code: 'HYB', description: 'Petrol + Electric', status: 'Active' },
        { id: 5, name: 'CNG', code: 'CNG', description: 'Compressed natural gas', status: 'Active' },
        { id: 6, name: 'LPG', code: 'LPG', description: 'Liquefied petroleum gas', status: 'Active' },
      ],

      // ==================== TRANSMISSION TYPES ====================
      transmissionTypes: [
        { id: 1, name: 'Automatic', code: 'AT', description: 'Automatic transmission', status: 'Active' },
        { id: 2, name: 'Manual', code: 'MT', description: 'Manual transmission', status: 'Active' },
        { id: 3, name: 'CVT', code: 'CVT', description: 'Continuously Variable Transmission', status: 'Active' },
        { id: 4, name: 'DCT', code: 'DCT', description: 'Dual-Clutch Transmission', status: 'Active' },
      ],

      // ==================== FETCH FUNCTIONS ====================
      fetchDesignations: () => get().designations,
      fetchLocations: () => get().locations,
      fetchMakes: () => get().makes,
      fetchVehicleCategories: () => get().vehicleCategories,
      fetchFuelTypes: () => get().fuelTypes,
      fetchTransmissionTypes: () => get().transmissionTypes,

      // ==================== GET ACTIVE ITEMS ====================
      getActiveDesignations: () => get().designations.filter(d => d.status === 'Active'),
      getActiveLocations: () => get().locations.filter(l => l.status === 'Active'),
      getActiveMakes: () => get().makes.filter(m => m.status === 'Active'),
      getActiveVehicleCategories: () => get().vehicleCategories.filter(c => c.status === 'Active'),
      getActiveFuelTypes: () => get().fuelTypes.filter(f => f.status === 'Active'),
      getActiveTransmissionTypes: () => get().transmissionTypes.filter(t => t.status === 'Active'),

      // ==================== CRUD FOR DESIGNATIONS ====================
      addDesignation: (item) => {
        const newItem = { ...item, id: Date.now(), status: 'Active' };
        set((state) => ({
          designations: [...state.designations, newItem]
        }));
        // ✅ Log the activity
        Logger.addDesignation(newItem);
      },
      
      updateDesignation: (id, updatedData) => {
        set((state) => ({
          designations: state.designations.map((item) =>
            item.id === id ? { ...item, ...updatedData, updatedAt: new Date().toISOString() } : item
          )
        }));
        // ✅ Log the activity
        Logger.updateDesignation({ id, ...updatedData });
      },
      
      deleteDesignation: (id) => {
        const itemToDelete = get().designations.find(item => item.id === id);
        set((state) => ({
          designations: state.designations.filter((item) => item.id !== id)
        }));
        // ✅ Log the activity
        if (itemToDelete) {
          Logger.deleteDesignation(id, itemToDelete.name);
        }
      },

      // ==================== CRUD FOR LOCATIONS ====================
      addLocation: (item) => {
        const newItem = { ...item, id: Date.now(), status: 'Active' };
        set((state) => ({
          locations: [...state.locations, newItem]
        }));
        // ✅ Log the activity
        Logger.addLocation(newItem);
      },
      
      updateLocation: (id, updatedData) => {
        set((state) => ({
          locations: state.locations.map((item) =>
            item.id === id ? { ...item, ...updatedData, updatedAt: new Date().toISOString() } : item
          )
        }));
        // ✅ Log the activity
        Logger.updateLocation({ id, ...updatedData });
      },
      
      deleteLocation: (id) => {
        const itemToDelete = get().locations.find(item => item.id === id);
        set((state) => ({
          locations: state.locations.filter((item) => item.id !== id)
        }));
        // ✅ Log the activity
        if (itemToDelete) {
          Logger.deleteLocation(id, itemToDelete.name);
        }
      },

      // ==================== CRUD FOR MAKES ====================
      addMake: (item) => {
        const newItem = { ...item, id: Date.now(), status: 'Active' };
        set((state) => ({
          makes: [...state.makes, newItem]
        }));
        // ✅ Log the activity
        Logger.addMake(newItem);
      },
      
      updateMake: (id, updatedData) => {
        set((state) => ({
          makes: state.makes.map((item) =>
            item.id === id ? { ...item, ...updatedData, updatedAt: new Date().toISOString() } : item
          )
        }));
        // ✅ Log the activity
        Logger.updateMake({ id, ...updatedData });
      },
      
      deleteMake: (id) => {
        const itemToDelete = get().makes.find(item => item.id === id);
        set((state) => ({
          makes: state.makes.filter((item) => item.id !== id)
        }));
        // ✅ Log the activity
        if (itemToDelete) {
          Logger.deleteMake(id, itemToDelete.name);
        }
      },

      // ==================== CRUD FOR VEHICLE CATEGORIES ====================
      addVehicleCategory: (item) => {
        const newItem = { ...item, id: Date.now(), status: 'Active', count: 0 };
        set((state) => ({
          vehicleCategories: [...state.vehicleCategories, newItem]
        }));
        // ✅ Log the activity
        Logger.addVehicleCategory(newItem);
      },
      
      updateVehicleCategory: (id, updatedData) => {
        set((state) => ({
          vehicleCategories: state.vehicleCategories.map((item) =>
            item.id === id ? { ...item, ...updatedData, updatedAt: new Date().toISOString() } : item
          )
        }));
        // ✅ Log the activity
        Logger.updateVehicleCategory({ id, ...updatedData });
      },
      
      deleteVehicleCategory: (id) => {
        const itemToDelete = get().vehicleCategories.find(item => item.id === id);
        set((state) => ({
          vehicleCategories: state.vehicleCategories.filter((item) => item.id !== id)
        }));
        // ✅ Log the activity
        if (itemToDelete) {
          Logger.deleteVehicleCategory(id, itemToDelete.name);
        }
      },

      // ==================== CRUD FOR FUEL TYPES ====================
      addFuelType: (item) => {
        const newItem = { ...item, id: Date.now(), status: 'Active' };
        set((state) => ({
          fuelTypes: [...state.fuelTypes, newItem]
        }));
        // ✅ Log the activity
        Logger.addFuelType(newItem);
      },
      
      updateFuelType: (id, updatedData) => {
        set((state) => ({
          fuelTypes: state.fuelTypes.map((item) =>
            item.id === id ? { ...item, ...updatedData, updatedAt: new Date().toISOString() } : item
          )
        }));
        // ✅ Log the activity
        Logger.updateFuelType({ id, ...updatedData });
      },
      
      deleteFuelType: (id) => {
        const itemToDelete = get().fuelTypes.find(item => item.id === id);
        set((state) => ({
          fuelTypes: state.fuelTypes.filter((item) => item.id !== id)
        }));
        // ✅ Log the activity
        if (itemToDelete) {
          Logger.deleteFuelType(id, itemToDelete.name);
        }
      },

      // ==================== CRUD FOR TRANSMISSION TYPES ====================
      addTransmission: (item) => {
        const newItem = { ...item, id: Date.now(), status: 'Active' };
        set((state) => ({
          transmissionTypes: [...state.transmissionTypes, newItem]
        }));
        // ✅ Log the activity
        Logger.addTransmission(newItem);
      },
      
      updateTransmission: (id, updatedData) => {
        set((state) => ({
          transmissionTypes: state.transmissionTypes.map((item) =>
            item.id === id ? { ...item, ...updatedData, updatedAt: new Date().toISOString() } : item
          )
        }));
        // ✅ Log the activity
        Logger.updateTransmission({ id, ...updatedData });
      },
      
      deleteTransmission: (id) => {
        const itemToDelete = get().transmissionTypes.find(item => item.id === id);
        set((state) => ({
          transmissionTypes: state.transmissionTypes.filter((item) => item.id !== id)
        }));
        // ✅ Log the activity
        if (itemToDelete) {
          Logger.deleteTransmission(id, itemToDelete.name);
        }
      },
    }),
    {
      name: 'ledger-storage',
    }
  )
);

export default useLedgerStore;