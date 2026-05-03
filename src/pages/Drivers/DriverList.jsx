import { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, User, Car, MapPin, Phone, Mail, Calendar, Search, Filter, X } from 'lucide-react';
import useDriverStore from '../../stores/driverStore';

export default function DriverList() {
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    vehicleCategory: '',
    location: '',
    designation: '',
    status: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Get data from store - NO loading state needed, data is already there
  const { drivers, deleteDriver } = useDriverStore();

  // Get unique values for filters from store data
  const uniqueLocations = [...new Set(drivers?.map(driver => driver.location) || [])];
  const uniqueDesignations = [...new Set(drivers?.map(driver => driver.designation) || [])];
  const uniqueVehicleCategories = [...new Set(drivers?.map(driver => driver.vehicleCategory) || [])];
  const statuses = ['Active', 'On Leave', 'Inactive'];

  // Filter drivers based on search term and filters
  const filteredDrivers = drivers?.filter(driver => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      driver.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phoneNumber?.includes(searchTerm) ||
      driver.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Vehicle category filter
    const matchesVehicleCategory = !filters.vehicleCategory || driver.vehicleCategory === filters.vehicleCategory;
    
    // Location filter
    const matchesLocation = !filters.location || driver.location === filters.location;
    
    // Designation filter
    const matchesDesignation = !filters.designation || driver.designation === filters.designation;
    
    // Status filter
    const matchesStatus = !filters.status || driver.status === filters.status;
    
    return matchesSearch && matchesVehicleCategory && matchesLocation && matchesDesignation && matchesStatus;
  }) || [];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'On Leave':
        return 'bg-yellow-100 text-yellow-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    console.log('Edit driver:', driver);
  };

  const handleDelete = async (driver) => {
    if (confirm(`Are you sure you want to delete driver ${driver.fullName}?`)) {
      const result = await deleteDriver(driver.id);
      if (result.success) {
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
          <div key={driver.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-lg transition">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-blue-50 to-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    {driver.profilePicture ? (
                      <img src={driver.profilePicture} alt={driver.fullName} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <User size={24} className="text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{driver.fullName}</h3>
                    <p className="text-sm text-gray-500">{driver.employeeId}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(driver.status)}`}>
                  {driver.status}
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="px-6 py-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User size={14} className="text-gray-400" />
                <span className="text-gray-600">{driver.designation}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Car size={14} className="text-gray-400" />
                <span className="text-gray-600">Vehicle: {driver.allocatedVehicle || 'Not Assigned'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={14} className="text-gray-400" />
                <span className="text-gray-600">{driver.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone size={14} className="text-gray-400" />
                <span className="text-gray-600">{driver.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail size={14} className="text-gray-400" />
                <span className="text-gray-600">{driver.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={14} className="text-gray-400" />
                <span className="text-gray-600">Allotted: {driver.dateOfAllotment || 'Not allotted'}</span>
              </div>
            </div>

            {/* Card Footer - Actions */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => handleViewDetails(driver)}
                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition"
                title="View Details"
              >
                <Eye size={18} />
              </button>
              <button
                onClick={() => handleEdit(driver)}
                className="p-1 text-green-600 hover:bg-green-100 rounded transition"
                title="Edit"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => handleDelete(driver)}
                className="p-1 text-red-600 hover:bg-red-100 rounded transition"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Driver Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  {selectedDriver.profilePicture ? (
                    <img src={selectedDriver.profilePicture} alt={selectedDriver.fullName} className="w-20 h-20 rounded-full object-cover" />
                  ) : (
                    <User size={40} className="text-blue-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedDriver.fullName}</h3>
                  <p className="text-gray-500">{selectedDriver.employeeId}</p>
                  <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(selectedDriver.status)}`}>
                    {selectedDriver.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500">Employee ID</label>
                  <p className="text-sm text-gray-900">{selectedDriver.employeeId}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Full Name</label>
                  <p className="text-sm text-gray-900">{selectedDriver.fullName}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">CNIC</label>
                  <p className="text-sm text-gray-900">{selectedDriver.cnic}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Phone Number</label>
                  <p className="text-sm text-gray-900">{selectedDriver.phoneNumber}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Email</label>
                  <p className="text-sm text-gray-900">{selectedDriver.email}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Designation</label>
                  <p className="text-sm text-gray-900">{selectedDriver.designation}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Location</label>
                  <p className="text-sm text-gray-900">{selectedDriver.location}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Allocated Vehicle</label>
                  <p className="text-sm text-gray-900">{selectedDriver.allocatedVehicle || 'Not Assigned'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Vehicle Category</label>
                  <p className="text-sm text-gray-900">{selectedDriver.vehicleCategory}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Date of Allotment</label>
                  <p className="text-sm text-gray-900">{selectedDriver.dateOfAllotment || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">License Number</label>
                  <p className="text-sm text-gray-900">{selectedDriver.licenseNumber}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">License Expiry</label>
                  <p className="text-sm text-gray-900">{selectedDriver.licenseExpiry}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Joining Date</label>
                  <p className="text-sm text-gray-900">{selectedDriver.joiningDate}</p>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleEdit(selectedDriver);
                  setShowDetailsModal(false);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Edit Driver
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Results Count */}
      <div className="text-sm text-gray-500 px-4">
        Showing {filteredDrivers.length} of {drivers?.length || 0} drivers
      </div>
    </div>
  );
}