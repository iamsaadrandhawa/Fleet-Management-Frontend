import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

      // ==================== transmissionTypes (FIXED - lowercase) ====================
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
      fetchtransmissionTypes: () => get().transmissionTypes,

      // ==================== GET ACTIVE ITEMS ====================
      getActiveDesignations: () => get().designations.filter(d => d.status === 'Active'),
      getActiveLocations: () => get().locations.filter(l => l.status === 'Active'),
      getActiveMakes: () => get().makes.filter(m => m.status === 'Active'),
      getActiveVehicleCategories: () => get().vehicleCategories.filter(c => c.status === 'Active'),
      getActiveFuelTypes: () => get().fuelTypes.filter(f => f.status === 'Active'),
      getActivetransmissionTypes: () => get().transmissionTypes.filter(t => t.status === 'Active'),

      // ==================== CRUD FOR DESIGNATIONS ====================
      addDesignation: (item) => set((state) => ({
        designations: [...state.designations, { ...item, id: Date.now(), status: 'Active' }]
      })),
      
      updateDesignation: (id, updatedData) => set((state) => ({
        designations: state.designations.map((item) =>
          item.id === id ? { ...item, ...updatedData } : item
        )
      })),
      
      deleteDesignation: (id) => set((state) => ({
        designations: state.designations.filter((item) => item.id !== id)
      })),

      // ==================== CRUD FOR LOCATIONS ====================
      addLocation: (item) => set((state) => ({
        locations: [...state.locations, { ...item, id: Date.now(), status: 'Active' }]
      })),
      
      updateLocation: (id, updatedData) => set((state) => ({
        locations: state.locations.map((item) =>
          item.id === id ? { ...item, ...updatedData } : item
        )
      })),
      
      deleteLocation: (id) => set((state) => ({
        locations: state.locations.filter((item) => item.id !== id)
      })),

      // ==================== CRUD FOR MAKES ====================
      addMake: (item) => set((state) => ({
        makes: [...state.makes, { ...item, id: Date.now(), status: 'Active' }]
      })),
      
      updateMake: (id, updatedData) => set((state) => ({
        makes: state.makes.map((item) =>
          item.id === id ? { ...item, ...updatedData } : item
        )
      })),
      
      deleteMake: (id) => set((state) => ({
        makes: state.makes.filter((item) => item.id !== id)
      })),

      // ==================== CRUD FOR VEHICLE CATEGORIES ====================
      addVehicleCategory: (item) => set((state) => ({
        vehicleCategories: [...state.vehicleCategories, { ...item, id: Date.now(), status: 'Active', count: 0 }]
      })),
      
      updateVehicleCategory: (id, updatedData) => set((state) => ({
        vehicleCategories: state.vehicleCategories.map((item) =>
          item.id === id ? { ...item, ...updatedData } : item
        )
      })),
      
      deleteVehicleCategory: (id) => set((state) => ({
        vehicleCategories: state.vehicleCategories.filter((item) => item.id !== id)
      })),

      // ==================== CRUD FOR FUEL TYPES ====================
      addFuelType: (item) => set((state) => ({
        fuelTypes: [...state.fuelTypes, { ...item, id: Date.now(), status: 'Active' }]
      })),
      
      updateFuelType: (id, updatedData) => set((state) => ({
        fuelTypes: state.fuelTypes.map((item) =>
          item.id === id ? { ...item, ...updatedData } : item
        )
      })),
      
      deleteFuelType: (id) => set((state) => ({
        fuelTypes: state.fuelTypes.filter((item) => item.id !== id)
      })),

      // ==================== CRUD FOR transmissionTypes ====================
      addTransmission: (item) => set((state) => ({
        transmissionTypes: [...state.transmissionTypes, { ...item, id: Date.now(), status: 'Active' }]
      })),
      
      updateTransmission: (id, updatedData) => set((state) => ({
        transmissionTypes: state.transmissionTypes.map((item) =>
          item.id === id ? { ...item, ...updatedData } : item
        )
      })),
      
      deleteTransmission: (id) => set((state) => ({
        transmissionTypes: state.transmissionTypes.filter((item) => item.id !== id)
      })),
    }),
    {
      name: 'ledger-storage',
    }
  )
);

export default useLedgerStore;