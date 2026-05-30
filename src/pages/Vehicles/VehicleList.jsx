import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Filter, X, Car } from 'lucide-react';
import useVehicleStore from '../../stores/vehicleStore';
import useLedgerStore from '../../stores/ledgerStore';
import useDriverStore from '../../stores/driverStore';
import VehicleTable from './VehicleTable';
import VehicleDetailsModal from '../Vehicles/VehicleDetailsModal';
import VehicleFormModal from '../Vehicles/VehicleFormModal';
import Logger from '../../utils/logger';

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

  // Get data from stores
  const { vehicles, fetchVehicles, deleteVehicle, updateVehicle } = useVehicleStore();
  const {
    makes,
    fuelTypes,
    transmissionTypes: transmissions,
    vehicleCategories,
    roles,
    designations,
    locations,
    fetchMakes,
    fetchFuelTypes,
    fetchTransmissions,
    fetchVehicleCategories,
    fetchRoles,
    fetchDesignations,
    fetchLocations,
  } = useLedgerStore();
  const { drivers, fetchDrivers } = useDriverStore();

  // Load data silently in background - NO LOADING STATE
  useEffect(() => {
    // Load all data without any UI indicators
    const loadData = async () => {
      await Promise.all([
        fetchVehicles(),
        fetchMakes(),
        fetchFuelTypes(),
        fetchTransmissions(),
        fetchVehicleCategories(),
        fetchRoles(),
        fetchDesignations(),
        fetchLocations(),
        fetchDrivers(),
      ]);
    };
    
    loadData();
  }, []); // Empty dependency array - runs once

  // Derived filter options from actual vehicle data
  const uniqueVehicleTypes = [
    ...new Set(
      vehicles?.map((v) => v.vehicleCategory || v.vehicleType)?.filter(Boolean) || []
    ),
  ];
  const uniqueFuelTypes = [
    ...new Set(vehicles?.map((v) => v.fuelType)?.filter(Boolean) || []),
  ];
  const uniqueTransmissions = [
    ...new Set(vehicles?.map((v) => v.transmission)?.filter(Boolean) || []),
  ];
  const statuses = ['active', 'inactive', 'in maintenance', 'out of service'];

  // Filter vehicles
  const filteredVehicles = vehicles?.filter((vehicle) => {
    const matchesSearch =
      searchTerm === '' ||
      vehicle.vehicleId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.registrationNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.assignedDriver &&
        vehicle.assignedDriver
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (vehicle.assignedTo?.name &&
        vehicle.assignedTo.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    const matchesType =
      !filters.type ||
      vehicle.vehicleCategory === filters.type ||
      vehicle.vehicleType === filters.type;
    const matchesFuelType =
      !filters.fuelType || vehicle.fuelType === filters.fuelType;
    const matchesStatus =
      !filters.status ||
      vehicle.status?.toLowerCase() === filters.status.toLowerCase();
    const matchesTransmission =
      !filters.transmission ||
      vehicle.transmission === filters.transmission;

    return (
      matchesSearch &&
      matchesType &&
      matchesFuelType &&
      matchesStatus &&
      matchesTransmission
    );
  }) || [];

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'in maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'out of service':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const clearFilters = () => {
    setFilters({ type: '', fuelType: '', status: '', transmission: '' });
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
    if (!selectedVehicle) return;
    const vehicleId = selectedVehicle._id || selectedVehicle.id;
    const result = await updateVehicle(vehicleId, formData);
    if (result.success) {
      Logger.updateVehicle({ id: vehicleId, ...formData });
      setShowEditModal(false);
      setSelectedVehicle(null);
      await fetchVehicles();
    } else {
      alert('Error updating vehicle: ' + result.error);
    }
  };

  const handleDelete = async (vehicle) => {
    const vehicleId = vehicle._id || vehicle.id;
    const displayId = vehicle.vehicleId || vehicle.vehicleNumber || vehicleId;
    if (confirm(`Are you sure you want to delete vehicle ${displayId}?`)) {
      const result = await deleteVehicle(vehicleId);
      if (result.success) {
        Logger.deleteVehicle(
          vehicleId,
          vehicle.registrationNumber || vehicle.vehicleNumber
        );
        await fetchVehicles();
      } else {
        alert('Error deleting vehicle: ' + result.error);
      }
    }
  };

  return (
    <div className="space-y-4 px-4 py-6 sm:px-6 lg:px-8">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by vehicle ID, registration, model, make, or driver..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition bg-white"
          >
            <Filter size={14} />
            Filters
            {(filters.type ||
              filters.fuelType ||
              filters.status ||
              filters.transmission) && (
              <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                Active
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                FILTER BY:
              </h3>
              <button
                onClick={clearFilters}
                className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
              >
                <X size={12} />
                Clear all
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Vehicle Type */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">
                  Vehicle Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) =>
                    setFilters({ ...filters, type: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
                >
                  <option value="">All Types</option>
                  {uniqueVehicleTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fuel Type */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">
                  Fuel Type
                </label>
                <select
                  value={filters.fuelType}
                  onChange={(e) =>
                    setFilters({ ...filters, fuelType: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
                >
                  <option value="">All Fuel Types</option>
                  {uniqueFuelTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Transmission */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">
                  Transmission
                </label>
                <select
                  value={filters.transmission}
                  onChange={(e) =>
                    setFilters({ ...filters, transmission: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
                >
                  <option value="">All</option>
                  {uniqueTransmissions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
                >
                  <option value="">All Status</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

     

      {/* Vehicle Table */}
      <VehicleTable
        vehicles={filteredVehicles}
        onView={handleViewDetails}
        onEdit={handleEdit}
        onDelete={handleDelete}
        getStatusBadge={getStatusBadge}
      />

      {/* Empty States */}
      {filteredVehicles.length === 0 && vehicles?.length > 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
          <Car size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            No vehicles match your filters
          </h3>
          <p className="text-gray-500 mt-1">
            Try adjusting your search or filter criteria
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {(!vehicles || vehicles.length === 0) && (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
          <Car size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            No vehicles found
          </h3>
          <p className="text-gray-500 mt-1">
            Add your first vehicle to get started
          </p>
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
          roles={roles}
          designations={designations}
          locations={locations}
        />
      )}

      <div className="text-center text-sm text-gray-500 mt-8">
            Showing {filteredVehicles.length} of {vehicles?.length || 0} vehicles
        </div>
    </div>
  );
}