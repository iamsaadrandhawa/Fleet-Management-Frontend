import { useState, useEffect } from 'react';
import { Search, Filter, X, Car } from 'lucide-react';
import useVehicleStore from '../../stores/vehicleStore';
import useLedgerStore from '../../stores/ledgerStore';
import useDriverStore from '../../stores/driverStore';
import VehicleCard from '../Vehicles/VehicleCard';
import VehicleDetailsModal from '../Vehicles/VehicleDetailsModal';
import VehicleFormModal from '../Vehicles/VehicleFormModal';
import Logger from '../../utils/Logger';

export default function VehicleList() {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    fuelType: '',
    status: '',
    transmission: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get data from stores
  const { vehicles, fetchVehicles, deleteVehicle, updateVehicle } = useVehicleStore();
  const { makes, fuelTypes, transmissions, vehicleCategories } = useLedgerStore();
  const { drivers } = useDriverStore();

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
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'Repair': return 'bg-red-100 text-red-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
    setSelectedVehicle(vehicle);
    setShowEditModal(true);
  };

  const handleUpdateVehicle = async (formData) => {
    if (selectedVehicle) {
      const result = await updateVehicle(selectedVehicle.id, formData);
      if (result.success) {
        Logger.updateVehicle({ id: selectedVehicle.id, ...formData });
        alert('Vehicle updated successfully!');
        setShowEditModal(false);
        setSelectedVehicle(null);
      } else {
        alert('Error updating vehicle');
      }
    }
  };

  const handleDelete = async (vehicle) => {
    if (confirm(`Are you sure you want to delete vehicle ${vehicle.vehicleId}?`)) {
      const result = await deleteVehicle(vehicle.id);
      if (result.success) {
        Logger.deleteVehicle(vehicle.id, vehicle.registrationNumber);
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
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            onView={handleViewDetails}
            onEdit={handleEdit}
            onDelete={handleDelete}
            getStatusBadge={getStatusBadge}
          />
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
        <VehicleDetailsModal
          vehicle={selectedVehicle}
          onClose={() => setShowDetailsModal(false)}
          onEdit={handleEdit}
          getStatusBadge={getStatusBadge}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedVehicle && (
        <VehicleFormModal
          isEditing={true}
          vehicle={selectedVehicle}
          onSubmit={handleUpdateVehicle}
          onClose={() => {
            setShowEditModal(false);
            setSelectedVehicle(null);
          }}
          makes={makes}
          fuelTypes={fuelTypes}
          transmissions={transmissions}
          vehicleCategories={vehicleCategories}
          drivers={drivers}
        />
      )}
       {/* Results Count */}
      <div className="text-sm text-gray-500 px-4">
        Showing {filteredVehicles.length} of {vehicles?.length || 0} vehicles
      </div>
    </div>
  );
}