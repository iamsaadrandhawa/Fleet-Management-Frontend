import { useState } from 'react';
import { Search, Filter, X, User } from 'lucide-react';
import useDriverStore from '../../stores/driverStore';
import useLedgerStore from '../../stores/ledgerStore';
import useVehicleStore from '../../stores/vehicleStore';
import DriverCard from '../Drivers/DriverCard';
import DriverDetailsModal from '../Drivers/DriverDetailsModal';
import DriverFormModal from '../Drivers/DriverFormModal';
import Logger from '../../utils/logger';

export default function DriverList() {
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    vehicleCategory: '',
    location: '',
    designation: '',
    status: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Get data from stores
  const { drivers, updateDriver, deleteDriver } = useDriverStore();
  const { designations, locations } = useLedgerStore();
  const { vehicles } = useVehicleStore();

  // Get unique values for filters from store data
  const uniqueLocations = [...new Set(drivers?.map(driver => driver.location) || [])];
  const uniqueDesignations = [...new Set(drivers?.map(driver => driver.designation) || [])];
  const uniqueVehicleCategories = [...new Set(drivers?.map(driver => driver.vehicleCategory) || [])];
  const statuses = ['Active', 'On Leave', 'Inactive'];

  // Filter drivers based on search term and filters
  const filteredDrivers = drivers?.filter(driver => {
    const matchesSearch = searchTerm === '' || 
      driver.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phoneNumber?.includes(searchTerm) ||
      driver.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesVehicleCategory = !filters.vehicleCategory || driver.vehicleCategory === filters.vehicleCategory;
    const matchesLocation = !filters.location || driver.location === filters.location;
    const matchesDesignation = !filters.designation || driver.designation === filters.designation;
    const matchesStatus = !filters.status || driver.status === filters.status;
    
    return matchesSearch && matchesVehicleCategory && matchesLocation && matchesDesignation && matchesStatus;
  }) || [];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'On Leave': return 'bg-yellow-100 text-yellow-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const clearFilters = () => {
    setFilters({
      vehicleCategory: '',
      location: '',
      designation: '',
      status: '',
    });
    setSearchTerm('');
  };

  const handleViewDetails = (driver) => {
    setSelectedDriver(driver);
    setShowDetailsModal(true);
  };

  const handleEdit = (driver) => {
    setSelectedDriver(driver);
    setShowEditModal(true);
  };

  const handleUpdateDriver = async (formData) => {
    if (selectedDriver) {
      const updatedData = {
        ...selectedDriver,
        ...formData,
        fullName: `${formData.firstName} ${formData.lastName}`,
      };
      
      const result = await updateDriver(selectedDriver.id, updatedData);
      if (result.success) {
        Logger.updateDriver(updatedData);
        alert('Driver updated successfully!');
        setShowEditModal(false);
        setSelectedDriver(null);
      } else {
        alert('Error updating driver');
      }
    }
  };

  const handleDelete = async (driver) => {
    if (confirm(`Are you sure you want to delete driver ${driver.fullName}?`)) {
      const result = await deleteDriver(driver.id);
      if (result.success) {
        Logger.deleteDriver(driver.id, driver.fullName);
        alert('Driver deleted successfully!');
      } else {
        alert('Error deleting driver');
      }
    }
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
              placeholder="Search by name, employee ID, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white"
            />
          </div>
          
          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition bg-white"
          >
            <Filter size={14} />
            Filters
            {(filters.vehicleCategory || filters.location || filters.designation || filters.status) && (
              <span className="bg-blue-600 text-white text-[10px] rounded-full px-1.5 py-0.5">
                Active
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[11px] font-medium text-gray-500">FILTER BY:</h3>
              <button
                onClick={clearFilters}
                className="text-[11px] text-red-500 hover:text-red-600 flex items-center gap-1"
              >
                <X size={12} />
                Clear all
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Vehicle Category Filter */}
              <div>
                <label className="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Vehicle Category</label>
                <select
                  value={filters.vehicleCategory}
                  onChange={(e) => setFilters({ ...filters, vehicleCategory: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
                >
                  <option value="">All Categories</option>
                  {uniqueVehicleCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Location</label>
                <select
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
                >
                  <option value="">All Locations</option>
                  {uniqueLocations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              {/* Designation Filter */}
              <div>
                <label className="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Designation</label>
                <select
                  value={filters.designation}
                  onChange={(e) => setFilters({ ...filters, designation: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
                >
                  <option value="">All Designations</option>
                  {uniqueDesignations.map(designation => (
                    <option key={designation} value={designation}>{designation}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
                >
                  <option value="">All Status</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      

      {/* Driver Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrivers.map((driver) => (
          <DriverCard
            key={driver.id}
            driver={driver}
            onView={handleViewDetails}
            onEdit={handleEdit}
            onDelete={handleDelete}
            getStatusBadge={getStatusBadge}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredDrivers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <User size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No drivers found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
          <button
            onClick={clearFilters}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedDriver && (
        <DriverDetailsModal
          driver={selectedDriver}
          onClose={() => setShowDetailsModal(false)}
          onEdit={handleEdit}
          getStatusBadge={getStatusBadge}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedDriver && (
        <DriverFormModal
          isEditing={true}
          driver={selectedDriver}
          onSubmit={handleUpdateDriver}
          onClose={() => {
            setShowEditModal(false);
            setSelectedDriver(null);
          }}
          designations={designations}
          locations={locations}
          vehicles={vehicles}
        />
      )}
      {/* Results Count */}
      <div className="text-sm text-gray-500 px-4">
        Showing {filteredDrivers.length} of {drivers?.length || 0} drivers
      </div>
    </div>
  );
}