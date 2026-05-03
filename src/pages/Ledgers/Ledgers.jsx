import { useState } from 'react';
import { Plus, Search, X, Filter } from 'lucide-react';
import useLedgerStore from '../../stores/ledgerStore';
import LedgerFormModal from '../Ledgers/LedgerFormModal';
import LedgerTableRow from '../Ledgers/LedgerTableRow';
import Logger from '../../utils/Logger';

export default function Ledgers() {
  const [activeTab, setActiveTab] = useState('designations');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Get data from store
  const designations = useLedgerStore((state) => state.designations);
  const locations = useLedgerStore((state) => state.locations);
  const makes = useLedgerStore((state) => state.makes);
  const vehicleCategories = useLedgerStore((state) => state.vehicleCategories);
  const fuelTypes = useLedgerStore((state) => state.fuelTypes);
  const transmissionTypes = useLedgerStore((state) => state.transmissionTypes);

  // Get add functions
  const addDesignation = useLedgerStore((state) => state.addDesignation);
  const addLocation = useLedgerStore((state) => state.addLocation);
  const addMake = useLedgerStore((state) => state.addMake);
  const addVehicleCategory = useLedgerStore((state) => state.addVehicleCategory);
  const addFuelType = useLedgerStore((state) => state.addFuelType);
  const addTransmission = useLedgerStore((state) => state.addTransmission);

  // Get update functions
  const updateDesignation = useLedgerStore((state) => state.updateDesignation);
  const updateLocation = useLedgerStore((state) => state.updateLocation);
  const updateMake = useLedgerStore((state) => state.updateMake);
  const updateVehicleCategory = useLedgerStore((state) => state.updateVehicleCategory);
  const updateFuelType = useLedgerStore((state) => state.updateFuelType);
  const updateTransmission = useLedgerStore((state) => state.updateTransmission);

  // Get delete functions
  const deleteDesignation = useLedgerStore((state) => state.deleteDesignation);
  const deleteLocation = useLedgerStore((state) => state.deleteLocation);
  const deleteMake = useLedgerStore((state) => state.deleteMake);
  const deleteVehicleCategory = useLedgerStore((state) => state.deleteVehicleCategory);
  const deleteFuelType = useLedgerStore((state) => state.deleteFuelType);
  const deleteTransmission = useLedgerStore((state) => state.deleteTransmission);

  const tabs = [
    { id: 'designations', name: 'Designations', data: designations, add: addDesignation, update: updateDesignation, delete: deleteDesignation, showStatus: true },
    { id: 'locations', name: 'Locations', data: locations, add: addLocation, update: updateLocation, delete: deleteLocation, showStatus: true },
    { id: 'makes', name: 'Vehicle Makes', data: makes, add: addMake, update: updateMake, delete: deleteMake, showStatus: true },
    { id: 'vehicleCategories', name: 'Vehicle Categories', data: vehicleCategories, add: addVehicleCategory, update: updateVehicleCategory, delete: deleteVehicleCategory, showStatus: true },
    { id: 'fuelTypes', name: 'Fuel Types', data: fuelTypes, add: addFuelType, update: updateFuelType, delete: deleteFuelType, showStatus: true },
    { id: 'transmissionTypes', name: 'transmissionTypes', data: transmissionTypes, add: addTransmission, update: updateTransmission, delete: deleteTransmission, showStatus: false },
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab);
  const currentData = currentTab?.data || [];

  // Filter data
  let filteredData = [...currentData];
  
  if (searchTerm) {
    filteredData = filteredData.filter(item =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  if (filterStatus && currentTab?.showStatus) {
    filteredData = filteredData.filter(item => item.status === filterStatus);
  }

  const handleAdd = (formData) => {
    const addFunction = currentTab?.add;
    if (addFunction) {
      addFunction({ 
        name: formData.name, 
        code: formData.code, 
        description: formData.description,
        status: 'Active'
      });
      
      // Log the activity
      const logMethod = `add${currentTab?.name.replace(/\s/g, '')}`;
      if (Logger[logMethod]) {
        Logger[logMethod]({ name: formData.name, code: formData.code });
      }
    }
    setShowAddModal(false);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleUpdate = (formData) => {
    const updateFunction = currentTab?.update;
    if (updateFunction && selectedItem) {
      updateFunction(selectedItem.id, {
        name: formData.name,
        code: formData.code,
        description: formData.description,
      });
      
      // Log the activity
      const logMethod = `update${currentTab?.name.replace(/\s/g, '')}`;
      if (Logger[logMethod]) {
        Logger[logMethod]({ id: selectedItem.id, name: formData.name });
      }
    }
    setShowEditModal(false);
    setSelectedItem(null);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      const deleteFunction = currentTab?.delete;
      if (deleteFunction) {
        deleteFunction(id);
        
        // Log the activity
        const logMethod = `delete${currentTab?.name.replace(/\s/g, '')}`;
        if (Logger[logMethod]) {
          Logger[logMethod](id, selectedItem?.name);
        }
      }
    }
  };

  const getStatusBadgeColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-600';
    switch(status) {
      case 'Active': return 'bg-green-50 text-green-600';
      case 'Inactive': return 'bg-red-50 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const clearFilters = () => {
    setFilterStatus('');
    setSearchTerm('');
  };

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      
      {/* Search and Filter Bar */}
      <div className="p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white"
            />
          </div>
          
          {/* Filter Toggle Button */}
          {currentTab?.showStatus && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition bg-white"
            >
              <Filter size={14} />
              Filters
              {filterStatus && (
                <span className="bg-blue-600 text-white text-[10px] rounded-full px-1.5 py-0.5">
                  1
                </span>
              )}
            </button>
          )}
          
          {/* Add Button */}
          {currentTab?.add && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition"
            >
              <Plus size={14} />
              Add New
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && currentTab?.showStatus && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[11px] font-medium text-gray-500">FILTER BY:</h3>
              {filterStatus && (
                <button
                  onClick={clearFilters}
                  className="text-[11px] text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <X size={12} />
                  Clear
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
                >
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto px-4">
        <nav className="flex gap-1 min-w-max">
          {tabs.map((tab) => (
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
              {tab.name} ({tab.data?.length || 0})
            </button>
          ))}
        </nav>
      </div>

     
      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                {currentTab?.showStatus && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                )}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item) => (
                <LedgerTableRow
                  key={item.id}
                  item={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  showStatus={currentTab?.showStatus}
                  getStatusBadgeColor={getStatusBadgeColor}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">📋</div>
            <h3 className="text-sm font-medium text-gray-900">No records found</h3>
            <p className="text-xs text-gray-500 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <LedgerFormModal
          isEditing={false}
          tabName={currentTab?.name}
          onSubmit={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedItem && (
        <LedgerFormModal
          isEditing={true}
          item={selectedItem}
          tabName={currentTab?.name}
          onSubmit={handleUpdate}
          onClose={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
        />
      )}
       {/* Results Count */}
      <div className="text-sm text-gray-500 px-4">
        Showing {filteredData.length} of {currentData.length} items
      </div>

    </div>
  );
}