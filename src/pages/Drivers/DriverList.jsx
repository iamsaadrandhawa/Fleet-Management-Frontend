import { useState, useEffect } from 'react';
import { Search, Filter, X, User } from 'lucide-react';
import useDriverStore from '../../stores/driverStore';
import useLedgerStore from '../../stores/ledgerStore';
import useVehicleStore from '../../stores/vehicleStore';
import DriverTable from './DriverTable';
import DriverDetailsModal from './DriverDetailsModal';
import DriverFormModal from './DriverFormModal';
import Logger from '../../utils/logger';

export default function DriverList() {
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    designation: '',
    status: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Get data from stores
  const { drivers, fetchDrivers, updateDriver, deleteDriver, isLoading } = useDriverStore();

  // FIX 1: Pull raw designations & locations from ledger store
  // Do NOT pre-filter here — pass the raw arrays to DriverFormModal
  // so the modal can do its own filtering internally
  const {
    designations,
    locations,
    fetchDesignations,
    fetchLocations,
  } = useLedgerStore();

  // FIX 2: Import vehicles from vehicleStore — was missing entirely,
  // causing vehicles={[]} to always be passed to DriverFormModal
  const { vehicles, fetchVehicles } = useVehicleStore();

  // Load all data on mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchDrivers(),
        fetchDesignations(),
        fetchLocations(),
        fetchVehicles(), // FIX 2: fetch vehicles so the modal dropdown is populated
      ]);
    };
    loadData();
  }, []);

  // Derived filter options built from actual driver data (for the filter dropdowns)
  const uniqueLocations = [
    ...new Set(
      drivers
        ?.map((driver) => driver.location?.name || (typeof driver.location === 'string' ? driver.location : null))
        ?.filter(Boolean) || []
    ),
  ];

  const uniqueDesignations = [
    ...new Set(
      drivers
        ?.map((driver) => driver.designation?.name || (typeof driver.designation === 'string' ? driver.designation : null))
        ?.filter(Boolean) || []
    ),
  ];

  const statuses = ['available', 'on trip', 'off duty', 'suspended'];

  // Filter drivers based on search term and filters
  const filteredDrivers =
    drivers?.filter((driver) => {
      const fullName = `${driver.firstName || ''} ${driver.lastName || ''}`;
      const driverLocation = driver.location?.name || driver.location || '';
      const driverDesignation = driver.designation?.name || driver.designation || '';

      const matchesSearch =
        searchTerm === '' ||
        fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.phoneNumber?.includes(searchTerm) ||
        driver.cnic?.includes(searchTerm) ||
        driver.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLocation = !filters.location || driverLocation === filters.location;
      const matchesDesignation = !filters.designation || driverDesignation === filters.designation;
      const matchesStatus = !filters.status || driver.status === filters.status;

      return matchesSearch && matchesLocation && matchesDesignation && matchesStatus;
    }) || [];

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':   return 'bg-green-100 text-green-800';
      case 'on trip':     return 'bg-blue-100 text-blue-800';
      case 'off duty':    return 'bg-yellow-100 text-yellow-800';
      case 'suspended':   return 'bg-red-100 text-red-800';
      default:            return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':   return 'Available';
      case 'on trip':     return 'On Trip';
      case 'off duty':    return 'Off Duty';
      case 'suspended':   return 'Suspended';
      default:            return status || 'N/A';
    }
  };

  const clearFilters = () => {
    setFilters({ location: '', designation: '', status: '' });
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
    if (!selectedDriver) return;
    const driverId = selectedDriver._id || selectedDriver.id;
    const result = await updateDriver(driverId, formData);
    if (result.success) {
      Logger.updateDriver({ id: driverId, ...formData });
      setShowEditModal(false);
      setSelectedDriver(null);
      await fetchDrivers();
    } else {
      alert('Error updating driver: ' + result.error);
    }
  };

  const handleDelete = async (driver) => {
    const driverId = driver._id || driver.id;
    const fullName = `${driver.firstName} ${driver.lastName}`;
    if (confirm(`Are you sure you want to delete driver ${fullName}?`)) {
      const result = await deleteDriver(driverId);
      if (result.success) {
        Logger.deleteDriver(driverId, fullName);
        await fetchDrivers();
      } else {
        alert('Error deleting driver: ' + result.error);
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
              placeholder="Search by name, employee ID, phone, CNIC, or license number..."
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
            {(filters.location || filters.designation || filters.status) && (
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Location Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">
                  Location
                </label>
                <select
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
                >
                  <option value="">All Locations</option>
                  {uniqueLocations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Designation Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">
                  Designation
                </label>
                <select
                  value={filters.designation}
                  onChange={(e) => setFilters({ ...filters, designation: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
                >
                  <option value="">All Designations</option>
                  {uniqueDesignations.map((designation) => (
                    <option key={designation} value={designation}>
                      {designation}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
                >
                  <option value="">All Status</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {getStatusText(status)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Driver Table */}
      <DriverTable
        drivers={filteredDrivers}
        isLoading={isLoading}
        onView={handleViewDetails}
        onEdit={handleEdit}
        onDelete={handleDelete}
        getStatusBadge={getStatusBadge}
        getStatusText={getStatusText}
      />

      {/* Empty States */}
      {filteredDrivers.length === 0 && drivers?.length > 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
          <User size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            No drivers match your filters
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

      {(!drivers || drivers.length === 0) && !isLoading && (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
          <User size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No drivers found</h3>
          <p className="text-gray-500 mt-1">Add your first driver to get started</p>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedDriver && (
        <DriverDetailsModal
          driver={selectedDriver}
          onClose={() => setShowDetailsModal(false)}
          onEdit={handleEdit}
          getStatusBadge={getStatusBadge}
          getStatusText={getStatusText}
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
          // FIX 1: Pass the RAW arrays — DriverFormModal filters them internally.
          // Previously activeDesignations/activeLocations were pre-filtered here,
          // then filtered AGAIN inside the modal, causing empty dropdowns.
          designations={designations}
          locations={locations}
          // FIX 2: Pass actual vehicles instead of hardcoded []
          vehicles={vehicles}
        />
      )}

      {/* Results Count Footer */}
      <div className="text-center text-sm text-gray-500 mt-8">
        Showing {filteredDrivers.length} of {drivers?.length || 0} drivers
      </div>
    </div>
  );
}