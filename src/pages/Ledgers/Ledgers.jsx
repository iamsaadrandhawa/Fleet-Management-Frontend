import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Plus, Search, X, Filter } from 'lucide-react';
import useLedgerStore from '../../stores/ledgerStore';
import LedgerFormModal from '../Ledgers/LedgerFormModal';
import LedgerTableRow from '../Ledgers/LedgerTableRow';
import Logger from '../../utils/logger';
import useLogStore from '../../stores/logStore';

export default function Ledgers() {
  const [activeTab, setActiveTab] = useState('roles');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [tableLoading, setTableLoading] = useState(false);
  const initialLoadDone = useRef(false);
  const tabChangeRef = useRef(false);

  // Get data from store
  const roles = useLedgerStore((state) => state.roles);
  const designations = useLedgerStore((state) => state.designations);
  const locations = useLedgerStore((state) => state.locations);
  const makes = useLedgerStore((state) => state.makes);
  const vehicleCategories = useLedgerStore((state) => state.vehicleCategories);
  const fuelTypes = useLedgerStore((state) => state.fuelTypes);
  const transmissionTypes = useLedgerStore((state) => state.transmissionTypes);

  // Get fetch functions
  const fetchRoles = useLedgerStore((state) => state.fetchRoles);
  const fetchDesignations = useLedgerStore((state) => state.fetchDesignations);
  const fetchLocations = useLedgerStore((state) => state.fetchLocations);
  const fetchMakes = useLedgerStore((state) => state.fetchMakes);
  const fetchVehicleCategories = useLedgerStore((state) => state.fetchVehicleCategories);
  const fetchFuelTypes = useLedgerStore((state) => state.fetchFuelTypes);
  const fetchTransmissions = useLedgerStore((state) => state.fetchTransmissions);

  // Get add functions
  const addRole = useLedgerStore((state) => state.addRole);
  const addDesignation = useLedgerStore((state) => state.addDesignation);
  const addLocation = useLedgerStore((state) => state.addLocation);
  const addMake = useLedgerStore((state) => state.addMake);
  const addVehicleCategory = useLedgerStore((state) => state.addVehicleCategory);
  const addFuelType = useLedgerStore((state) => state.addFuelType);
  const addTransmission = useLedgerStore((state) => state.addTransmission);

  // Get update functions
  const updateRole = useLedgerStore((state) => state.updateRole);
  const updateDesignation = useLedgerStore((state) => state.updateDesignation);
  const updateLocation = useLedgerStore((state) => state.updateLocation);
  const updateMake = useLedgerStore((state) => state.updateMake);
  const updateVehicleCategory = useLedgerStore((state) => state.updateVehicleCategory);
  const updateFuelType = useLedgerStore((state) => state.updateFuelType);
  const updateTransmission = useLedgerStore((state) => state.updateTransmission);

  // Get delete functions
  const deleteRole = useLedgerStore((state) => state.deleteRole);
  const deleteDesignation = useLedgerStore((state) => state.deleteDesignation);
  const deleteLocation = useLedgerStore((state) => state.deleteLocation);
  const deleteMake = useLedgerStore((state) => state.deleteMake);
  const deleteVehicleCategory = useLedgerStore((state) => state.deleteVehicleCategory);
  const deleteFuelType = useLedgerStore((state) => state.deleteFuelType);
  const deleteTransmission = useLedgerStore((state) => state.deleteTransmission);

  // Get log functions from logStore
  const logCreate = useLogStore((state) => state.logCreate);
  const logUpdate = useLogStore((state) => state.logUpdate);
  const logDelete = useLogStore((state) => state.logDelete);

  // Store state
  const error = useLedgerStore((state) => state.error);
  const initializeAllData = useLedgerStore((state) => state.initializeAllData);
  const clearError = useLedgerStore((state) => state.clearError);

  // Create a map of fetch functions
  const fetchFunctions = useMemo(() => ({
    roles: fetchRoles,
    designations: fetchDesignations,
    locations: fetchLocations,
    makes: fetchMakes,
    vehicleCategories: fetchVehicleCategories,
    fuelTypes: fetchFuelTypes,
    transmissionTypes: fetchTransmissions
  }), [fetchRoles, fetchDesignations, fetchLocations, fetchMakes, fetchVehicleCategories, fetchFuelTypes, fetchTransmissions]);

  // Create tabs configuration
  const tabsConfig = useMemo(() => [
    { id: 'roles', name: 'Roles', showStatus: true, showPermissions: true },
    { id: 'designations', name: 'Designations', showStatus: true, showPermissions: false },
    { id: 'locations', name: 'Locations', showStatus: true, showPermissions: false },
    { id: 'makes', name: 'Vehicle Makes', showStatus: true, showPermissions: false },
    { id: 'vehicleCategories', name: 'Vehicle Categories', showStatus: true, showPermissions: false },
    { id: 'fuelTypes', name: 'Fuel Types', showStatus: true, showPermissions: false },
    { id: 'transmissionTypes', name: 'Transmissions', showStatus: false, showPermissions: false }
  ], []);

  // Get data based on active tab
  const getDataForTab = useCallback(() => {
    switch (activeTab) {
      case 'roles': return roles;
      case 'designations': return designations;
      case 'locations': return locations;
      case 'makes': return makes;
      case 'vehicleCategories': return vehicleCategories;
      case 'fuelTypes': return fuelTypes;
      case 'transmissionTypes': return transmissionTypes;
      default: return [];
    }
  }, [activeTab, roles, designations, locations, makes, vehicleCategories, fuelTypes, transmissionTypes]);

  // Get data length for tab count
  const getDataLengthForTab = useCallback((tabId) => {
    switch (tabId) {
      case 'roles': return roles?.length || 0;
      case 'designations': return designations?.length || 0;
      case 'locations': return locations?.length || 0;
      case 'makes': return makes?.length || 0;
      case 'vehicleCategories': return vehicleCategories?.length || 0;
      case 'fuelTypes': return fuelTypes?.length || 0;
      case 'transmissionTypes': return transmissionTypes?.length || 0;
      default: return 0;
    }
  }, [roles, designations, locations, makes, vehicleCategories, fuelTypes, transmissionTypes]);

  const currentData = getDataForTab();
  const currentTabConfig = tabsConfig.find(tab => tab.id === activeTab);

  // Load data only when tab changes and data is empty
  const loadTabData = useCallback(async (force = false) => {
    const fetchFunction = fetchFunctions[activeTab];
    const currentDataLength = getDataForTab().length;
    
    if (fetchFunction && (force || currentDataLength === 0)) {
      setTableLoading(true);
      try {
        await fetchFunction();
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setTableLoading(false);
      }
    }
  }, [activeTab, fetchFunctions, getDataForTab]);

  // Initial load of all data
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      const loadAllData = async () => {
        setTableLoading(true);
        try {
          await initializeAllData();
        } catch (error) {
          console.error('Error loading initial data:', error);
        } finally {
          setTableLoading(false);
        }
      };
      loadAllData();
    }
  }, [initializeAllData]);

  // Load tab data when tab changes and data is empty
  useEffect(() => {
    if (initialLoadDone.current) {
      loadTabData();
    }
  }, [activeTab, loadTabData]);

  // Filter data
  const filteredData = useMemo(() => {
    let filtered = [...currentData];
    
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus && currentTabConfig?.showStatus) {
      filtered = filtered.filter(item => 
        item.status?.toLowerCase() === filterStatus.toLowerCase()
      );
    }
    
    return filtered;
  }, [currentData, searchTerm, filterStatus, currentTabConfig?.showStatus]);

  const handleAdd = async (formData) => {
    let addFunction;
    switch (activeTab) {
      case 'roles': addFunction = addRole; break;
      case 'designations': addFunction = addDesignation; break;
      case 'locations': addFunction = addLocation; break;
      case 'makes': addFunction = addMake; break;
      case 'vehicleCategories': addFunction = addVehicleCategory; break;
      case 'fuelTypes': addFunction = addFuelType; break;
      case 'transmissionTypes': addFunction = addTransmission; break;
      default: return;
    }

    if (addFunction) {
      setTableLoading(true);
      try {
        const payload = { 
          name: formData.name,
          code: formData.code, 
          description: formData.description,
          status: 'active'
        };
        
        if (activeTab === 'roles') {
          payload.permissions = formData.permissions;
          payload.tabPermissions = formData.tabPermissions;
        }
        
        console.log('📦 Sending to store - payload:', payload);
        
        const result = await addFunction(payload);
        
        if (result?.success) {
          setShowAddModal(false);
          await fetchFunctions[activeTab]();
          console.log('✅ Item added successfully');
        } else {
          console.error('Failed to add:', result?.error);
          alert(result?.error || 'Failed to add item');
        }
      } catch (error) {
        console.error('Error adding item:', error);
        alert(error.message || 'Error adding item');
      } finally {
        setTableLoading(false);
      }
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleUpdate = async (formData) => {
    let updateFunction;
    switch (activeTab) {
      case 'roles': updateFunction = updateRole; break;
      case 'designations': updateFunction = updateDesignation; break;
      case 'locations': updateFunction = updateLocation; break;
      case 'makes': updateFunction = updateMake; break;
      case 'vehicleCategories': updateFunction = updateVehicleCategory; break;
      case 'fuelTypes': updateFunction = updateFuelType; break;
      case 'transmissionTypes': updateFunction = updateTransmission; break;
      default: return;
    }

    if (updateFunction && selectedItem) {
      setTableLoading(true);
      try {
        const itemId = selectedItem._id || selectedItem.id;
        
        const payload = {
          name: formData.name,
          code: formData.code,
          description: formData.description,
        };
        
        if (activeTab === 'roles') {
          payload.permissions = formData.permissions;
          payload.tabPermissions = formData.tabPermissions;
        }
        
        console.log('📦 Updating store - payload:', payload);
        
        const result = await updateFunction(itemId, payload);
        
        if (result?.success) {
          setShowEditModal(false);
          setSelectedItem(null);
          await fetchFunctions[activeTab]();
          console.log('✅ Item updated successfully');
        } else {
          console.error('Failed to update:', result?.error);
          alert(result?.error || 'Failed to update item');
        }
      } catch (error) {
        console.error('Error updating item:', error);
        alert(error.message || 'Error updating item');
      } finally {
        setTableLoading(false);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      let deleteFunction;
      
      switch (activeTab) {
        case 'roles': deleteFunction = deleteRole; break;
        case 'designations': deleteFunction = deleteDesignation; break;
        case 'locations': deleteFunction = deleteLocation; break;
        case 'makes': deleteFunction = deleteMake; break;
        case 'vehicleCategories': deleteFunction = deleteVehicleCategory; break;
        case 'fuelTypes': deleteFunction = deleteFuelType; break;
        case 'transmissionTypes': deleteFunction = deleteTransmission; break;
        default: return;
      }

      if (deleteFunction) {
        setTableLoading(true);
        try {
          const result = await deleteFunction(id);
          
          if (result?.success) {
            await fetchFunctions[activeTab]();
            console.log('✅ Item deleted successfully');
          } else {
            console.error('Failed to delete:', result?.error);
            alert(result?.error || 'Failed to delete item');
          }
        } catch (error) {
          console.error('Error deleting item:', error);
          alert(error.message || 'Error deleting item');
        } finally {
          setTableLoading(false);
        }
      }
    }
  };

  const getStatusBadgeColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-600';
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-50 text-green-600';
      case 'inactive': return 'bg-red-50 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const clearFilters = () => {
    setFilterStatus('');
    setSearchTerm('');
  };

  // Only show full page error
  if (error && !currentData.length && !tableLoading) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">Error: {error}</p>
          <button
            onClick={() => loadTabData(true)}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by name, code or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
              />
            </div>
            
            <div className="flex gap-2">
              {currentTabConfig?.showStatus && (
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition bg-white"
                >
                  <Filter size={14} />
                  Filters
                  {filterStatus && (
                    <span className="bg-blue-600 text-white text-[10px] rounded-full px-1.5 py-0.5">
                      Active
                    </span>
                  )}
                </button>
              )}
              
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
              >
                <Plus size={14} />
                Add New {currentTabConfig?.name?.slice(0, -1) || 'Item'}
              </button>
            </div>
          </div>
          
          {/* Filter Panel */}
          {showFilters && currentTabConfig?.showStatus && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-700">Filter by:</h3>
                {filterStatus && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <X size={14} />
                    Clear all
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto px-4">
        <nav className="flex gap-1 min-w-max">
          {tabsConfig.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchTerm('');
                setFilterStatus('');
                setShowFilters(false);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.name} ({getDataLengthForTab(tab.id)})
            </button>
          ))}
        </nav>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto relative min-h-[200px]">
          {tableLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-xs text-gray-500">Loading...</p>
              </div>
            </div>
          )}
          
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                {currentTabConfig?.showPermissions && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                {currentTabConfig?.showStatus && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                )}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {!tableLoading && filteredData.map((item) => (
                <LedgerTableRow
                  key={item._id || item.id}
                  item={{
                    ...item,
                    id: item._id || item.id
                  }}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  showStatus={currentTabConfig?.showStatus}
                  showPermissions={currentTabConfig?.showPermissions}
                  getStatusBadgeColor={getStatusBadgeColor}
                />
              ))}
            </tbody>
          </table>

          {/* Loading Skeleton */}
          {tableLoading && filteredData.length === 0 && (
            <div className="divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((index) => (
                <div key={index} className="px-6 py-4 animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1"><div className="h-4 bg-gray-200 rounded w-3/4"></div></div>
                    <div className="flex-1"><div className="h-4 bg-gray-200 rounded w-1/2"></div></div>
                    {currentTabConfig?.showPermissions && (
                      <div className="flex-1"><div className="h-4 bg-gray-200 rounded w-1/2"></div></div>
                    )}
                    <div className="flex-1"><div className="h-4 bg-gray-200 rounded w-2/3"></div></div>
                    {currentTabConfig?.showStatus && (
                      <div className="flex-1"><div className="h-4 bg-gray-200 rounded w-1/4"></div></div>
                    )}
                    <div className="w-20"><div className="h-4 bg-gray-200 rounded w-full"></div></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!tableLoading && filteredData.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">📋</div>
              <h3 className="text-sm font-medium text-gray-900">No {currentTabConfig?.name?.toLowerCase()} found</h3>
              <p className="text-xs text-gray-500 mt-1">Click "Add New {currentTabConfig?.name?.slice(0, -1)}" to create one</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <LedgerFormModal
          isEditing={false}
          item={null}
          tabName={currentTabConfig?.name}
          tabId={activeTab}
          onSubmit={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showEditModal && selectedItem && (
        <LedgerFormModal
          isEditing={true}
          item={selectedItem}
          tabName={currentTabConfig?.name}
          tabId={activeTab}
          onSubmit={handleUpdate}
          onClose={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
        />
      )}
      
      {/* Results Count */}
      {currentData.length > 0 && (
        <div className="text-sm text-gray-500 px-4">
          Showing {filteredData.length} of {currentData.length} items
        </div>
      )}
    </div>
  );
}