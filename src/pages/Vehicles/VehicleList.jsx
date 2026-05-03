import { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, Car, Search, Filter, X } from 'lucide-react';
import useVehicleStore from '../../stores/vehicleStore';

export default function VehicleList() {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    fuelType: '',
    status: '',
    transmission: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get data from store
  const { vehicles, fetchVehicles, deleteVehicle, updateVehicle } = useVehicleStore();

  // Fetch vehicles on component mount
  useEffect(() => {
    const loadVehicles = async () => {
      setIsLoading(true);
      await fetchVehicles();
      setIsLoading(false);
    };
    loadVehicles();
  }, []);

  // Get unique values for filters
  const uniqueVehicleTypes = [...new Set(vehicles?.map(v => v.vehicleCategory) || [])];
  const uniqueFuelTypes = [...new Set(vehicles?.map(v => v.fuelType) || [])];
  const uniqueTransmissions = [...new Set(vehicles?.map(v => v.transmission) || [])];
  const statuses = ['Active', 'Maintenance', 'Repair', 'Inactive'];

  // Filter vehicles based on search term and filters
  const filteredVehicles = vehicles?.filter(vehicle => {
    const matchesSearch = searchTerm === '' || 
      vehicle.vehicleId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.assignedDriver && vehicle.assignedDriver.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = !filters.type || vehicle.vehicleCategory === filters.type;
    const matchesFuelType = !filters.fuelType || vehicle.fuelType === filters.fuelType;
    const matchesStatus = !filters.status || vehicle.status === filters.status;
    const matchesTransmission = !filters.transmission || vehicle.transmission === filters.transmission;
    
    return matchesSearch && matchesType && matchesFuelType && matchesStatus && matchesTransmission;
  }) || [];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'Repair':
        return 'bg-red-100 text-red-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      fuelType: '',
      status: '',
      transmission: '',
    });
    setSearchTerm('');
  };

  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDetailsModal(true);
  };

  const handleEdit = (vehicle) => {
    console.log('Edit vehicle:', vehicle);
    // Navigate to edit page or open edit modal
  };

  const handleDelete = async (vehicle) => {
    if (confirm(`Are you sure you want to delete vehicle ${vehicle.vehicleId}?`)) {
      const result = await deleteVehicle(vehicle.id);
      if (result.success) {
        alert('Vehicle deleted successfully!');
      } else {
        alert('Error deleting vehicle');
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading vehicles...</p>
        </div>
      </div>
    );
  }

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
              placeholder="Search by vehicle ID, registration, model, make, or driver..."
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
            {(filters.type || filters.fuelType || filters.status || filters.transmission) && (
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
              {/* Vehicle Type Filter */}
              <div>
                <label className="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Vehicle Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
                >
                  <option value="">All Types</option>
                  {uniqueVehicleTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Fuel Type Filter */}
              <div>
                <label className="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Fuel Type</label>
                <select
                  value={filters.fuelType}
                  onChange={(e) => setFilters({ ...filters, fuelType: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
                >
                  <option value="">All Fuel Types</option>
                  {uniqueFuelTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Transmission Filter */}
              <div>
                <label className="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Transmission</label>
                <select
                  value={filters.transmission}
                  onChange={(e) => setFilters({ ...filters, transmission: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
                >
                  <option value="">All</option>
                  {uniqueTransmissions.map(type => (
                    <option key={type} value={type}>{type}</option>
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

      

      {/* Vehicle Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <div key={vehicle.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-lg transition">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-blue-50 to-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Car size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{vehicle.make} {vehicle.model}</h3>
                    <p className="text-sm text-gray-500">{vehicle.vehicleId}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(vehicle.status)}`}>
                  {vehicle.status}
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="px-6 py-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Registration:</span>
                <span className="text-gray-900 font-medium">{vehicle.registrationNumber}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Year:</span>
                <span className="text-gray-900">{vehicle.year}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Color:</span>
                <span className="text-gray-900">{vehicle.color}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Fuel Type:</span>
                <span className="text-gray-900">{vehicle.fuelType}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Transmission:</span>
                <span className="text-gray-900">{vehicle.transmission}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Assigned Driver:</span>
                <span className="text-gray-900">{vehicle.assignedDriver || 'Not Assigned'}</span>
              </div>
            </div>

            {/* Card Footer - Actions */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => handleViewDetails(vehicle)}
                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition"
                title="View Details"
              >
                <Eye size={18} />
              </button>
              <button
                onClick={() => handleEdit(vehicle)}
                className="p-1 text-green-600 hover:bg-green-100 rounded transition"
                title="Edit"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => handleDelete(vehicle)}
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
      {filteredVehicles.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Car size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No vehicles found</h3>
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
      {showDetailsModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Vehicle Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Vehicle Header */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Car size={40} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedVehicle.make} {selectedVehicle.model}</h3>
                  <p className="text-gray-500">{selectedVehicle.vehicleId}</p>
                  <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(selectedVehicle.status)}`}>
                    {selectedVehicle.status}
                  </span>
                </div>
              </div>

              {/* Two Column Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700 border-b pb-1">Basic Information</h4>
                  <div><label className="text-xs text-gray-500">Vehicle ID</label><p className="text-sm text-gray-900">{selectedVehicle.vehicleId}</p></div>
                  <div><label className="text-xs text-gray-500">Registration Number</label><p className="text-sm text-gray-900">{selectedVehicle.registrationNumber}</p></div>
                  <div><label className="text-xs text-gray-500">Make</label><p className="text-sm text-gray-900">{selectedVehicle.make}</p></div>
                  <div><label className="text-xs text-gray-500">Model</label><p className="text-sm text-gray-900">{selectedVehicle.model}</p></div>
                  <div><label className="text-xs text-gray-500">Year</label><p className="text-sm text-gray-900">{selectedVehicle.year}</p></div>
                  <div><label className="text-xs text-gray-500">Color</label><p className="text-sm text-gray-900">{selectedVehicle.color}</p></div>
                  <div><label className="text-xs text-gray-500">Vehicle Category</label><p className="text-sm text-gray-900">{selectedVehicle.vehicleCategory}</p></div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700 border-b pb-1">Technical Specifications</h4>
                  <div><label className="text-xs text-gray-500">Fuel Type</label><p className="text-sm text-gray-900">{selectedVehicle.fuelType}</p></div>
                  <div><label className="text-xs text-gray-500">Transmission</label><p className="text-sm text-gray-900">{selectedVehicle.transmission}</p></div>
                  <div><label className="text-xs text-gray-500">Seating Capacity</label><p className="text-sm text-gray-900">{selectedVehicle.seatingCapacity}</p></div>
                  <div><label className="text-xs text-gray-500">Chassis Number</label><p className="text-sm text-gray-900">{selectedVehicle.chassisNumber}</p></div>
                  <div><label className="text-xs text-gray-500">Engine Number</label><p className="text-sm text-gray-900">{selectedVehicle.engineNumber}</p></div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700 border-b pb-1">Registration & Documents</h4>
                  <div><label className="text-xs text-gray-500">Registration Date</label><p className="text-sm text-gray-900">{selectedVehicle.registrationDate}</p></div>
                  <div><label className="text-xs text-gray-500">Insurance Expiry</label><p className="text-sm text-gray-900">{selectedVehicle.insuranceExpiry}</p></div>
                  <div><label className="text-xs text-gray-500">Fitness Expiry</label><p className="text-sm text-gray-900">{selectedVehicle.fitnessExpiry}</p></div>
                  <div><label className="text-xs text-gray-500">Pollution Expiry</label><p className="text-sm text-gray-900">{selectedVehicle.pollutionExpiry}</p></div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700 border-b pb-1">Assignment & Purchase</h4>
                  <div><label className="text-xs text-gray-500">Assigned Driver</label><p className="text-sm text-gray-900">{selectedVehicle.assignedDriver || 'Not Assigned'}</p></div>
                  <div><label className="text-xs text-gray-500">Purchase Date</label><p className="text-sm text-gray-900">{selectedVehicle.purchaseDate}</p></div>
                  <div><label className="text-xs text-gray-500">Purchase Price</label><p className="text-sm text-gray-900">${selectedVehicle.purchasePrice}</p></div>
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
                  handleEdit(selectedVehicle);
                  setShowDetailsModal(false);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Edit Vehicle
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Results Count */}
      <div className="text-sm text-gray-500 px-4">
        Showing {filteredVehicles.length} of {vehicles?.length || 0} vehicles
      </div>
    </div>
  );
}