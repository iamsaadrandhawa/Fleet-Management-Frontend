import useLedgerStore from '../stores/ledgerStore';

const useLedgerData = () => {
  const store = useLedgerStore();
  
  // Get all lists
  const designations = store.designations;
  const vehicleCategories = store.vehicleCategories;
  const fuelTypes = store.fuelTypes;
  const vehicleStatuses = store.vehicleStatuses;
  const driverStatuses = store.driverStatuses;
  const locations = store.locations;
  const documentTypes = store.documentTypes;

  // Get active lists (for dropdowns)
  const activeDesignations = designations.filter(d => d.status === 'Active');
  const activeVehicleCategories = vehicleCategories.filter(c => c.status === 'Active');
  const activeFuelTypes = fuelTypes.filter(f => f.status === 'Active');
  const activeLocations = locations.filter(l => l.status === 'Active');

  // Helper to get designation by ID
  const getDesignationById = (id) => designations.find(d => d.id === id);
  
  // Helper to get vehicle category by ID
  const getVehicleCategoryById = (id) => vehicleCategories.find(c => c.id === id);
  
  // Helper to get location by ID
  const getLocationById = (id) => locations.find(l => l.id === id);

  return {
    // Lists
    designations,
    vehicleCategories,
    fuelTypes,
    vehicleStatuses,
    driverStatuses,
    locations,
    documentTypes,
    
    // Active lists for dropdowns
    activeDesignations,
    activeVehicleCategories,
    activeFuelTypes,
    activeLocations,
    
    // Helper methods
    getDesignationById,
    getVehicleCategoryById,
    getLocationById,
    
    // CRUD operations
    addDesignation: store.addDesignation,
    updateDesignation: store.updateDesignation,
    deleteDesignation: store.deleteDesignation,
    
    addVehicleCategory: store.addVehicleCategory,
    updateVehicleCategory: store.updateVehicleCategory,
    deleteVehicleCategory: store.deleteVehicleCategory,
    
    addFuelType: store.addFuelType,
    updateFuelType: store.updateFuelType,
    deleteFuelType: store.deleteFuelType,
    
    addLocation: store.addLocation,
    updateLocation: store.updateLocation,
    deleteLocation: store.deleteLocation,
  };
};

export default useLedgerData;