import { Car, X, User, Phone,IdCardLanyard } from 'lucide-react';

export default function VehicleDetailsModal({ vehicle, onClose, onEdit, getStatusBadge }) {
  // Helper function to get driver full name
  const getDriverFullName = (driver) => {
    if (!driver) return 'Not Assigned';
    if (typeof driver === 'object') {
      const firstName = driver.firstName || '';
      const lastName = driver.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      return fullName || driver.name || driver.fullName || 'Unknown Driver';
    }
    return driver;
  };

  // Helper to get driver employee ID
  const getDriverEmployeeId = (driver) => {
    if (driver && typeof driver === 'object' && driver.employeeId) {
      return driver.employeeId;
    }
    return null;
  };

  // Helper to get driver phone (optional - for additional info)
  const getDriverPhone = (driver) => {
    if (driver && typeof driver === 'object' && driver.phoneNumber) {
      return driver.phoneNumber;
    }
    return null;
  };

  // Get assigned driver info
  const assignedDriver = vehicle.assignedTo || vehicle.assignedDriver;
  const driverName = getDriverFullName(assignedDriver);
  const driverEmployeeId = getDriverEmployeeId(assignedDriver);
  const driverPhone = getDriverPhone(assignedDriver);

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Vehicle Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Vehicle Header */}
          <div className="flex items-center gap-4 pb-4 border-b">
            <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center">
              <Car size={40} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {vehicle.company || vehicle.make} {vehicle.model}
              </h3>
              <p className="text-gray-500">{vehicle.vehicleId || vehicle.vehicleNumber}</p>
              <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(vehicle.status)}`}>
                {vehicle.status ? vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1) : '—'}
              </span>
            </div>
          </div>

          {/* Two Column Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700 border-b pb-1">Basic Information</h4>
              <div>
                <label className="text-xs text-gray-500">Vehicle ID</label>
                <p className="text-sm text-gray-900">{vehicle.vehicleId || vehicle._id || '—'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Registration Number</label>
                <p className="text-sm text-gray-900">{vehicle.registrationNumber || '—'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Make</label>
                <p className="text-sm text-gray-900">{vehicle.company || vehicle.make || '—'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Model</label>
                <p className="text-sm text-gray-900">{vehicle.model || '—'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Year</label>
                <p className="text-sm text-gray-900">{vehicle.year || '—'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Color</label>
                <p className="text-sm text-gray-900">{vehicle.color || '—'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Vehicle Category</label>
                <p className="text-sm text-gray-900">{vehicle.vehicleCategory || '—'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700 border-b pb-1">Technical Specifications</h4>
              <div>
                <label className="text-xs text-gray-500">Fuel Type</label>
                <p className="text-sm text-gray-900">{vehicle.fuelType || '—'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Transmission</label>
                <p className="text-sm text-gray-900">{vehicle.transmission || '—'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Seating Capacity</label>
                <p className="text-sm text-gray-900">{vehicle.seatingCapacity || '—'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Chassis Number</label>
                <p className="text-sm text-gray-900">{vehicle.chassisNumber || '—'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Engine Number</label>
                <p className="text-sm text-gray-900">{vehicle.engineNumber || '—'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Meter Reading</label>
                <p className="text-sm text-gray-900">{vehicle.meterReading || '0'} km</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700 border-b pb-1">Registration & Documents</h4>
              <div>
                <label className="text-xs text-gray-500">Registration Date</label>
                <p className="text-sm text-gray-900">{vehicle.registrationDate ? new Date(vehicle.registrationDate).toLocaleDateString() : '—'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Insurance Expiry</label>
                <p className="text-sm text-gray-900">{vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toLocaleDateString() : '—'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Fitness Expiry</label>
                <p className="text-sm text-gray-900">{vehicle.fitnessExpiry ? new Date(vehicle.fitnessExpiry).toLocaleDateString() : '—'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Pollution Expiry</label>
                <p className="text-sm text-gray-900">{vehicle.pollutionExpiry ? new Date(vehicle.pollutionExpiry).toLocaleDateString() : '—'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700 border-b pb-1">Assignment & Purchase</h4>
              {/* Assigned Driver - Shows full driver info with Employee ID */}
              <div>
                <label className="text-xs text-gray-500">Assigned Driver</label>
                {assignedDriver ? (
                  <div className="mt-1 p-2 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-green-600" />
                      <span className="text-xs text-gray-500">Employee Name:</span>
                      <p className="text-sm font-medium text-gray-900">{driverName}</p>
                    </div>
                    {driverEmployeeId && (
                      <div className="flex items-center gap-2 mt-1">
                        <IdCardLanyard size={14} className="text-green-600" />
                        <span className="text-xs text-gray-500">Employee ID:</span>
                        <p className="text-xs text-gray-700 font-mono">{driverEmployeeId}</p>
                      </div>
                    )}
                   
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Not Assigned</p>
                )}
              </div>
              <div>
                <label className="text-xs text-gray-500">Purchase Date</label>
                <p className="text-sm text-gray-900">{vehicle.purchaseDate ? new Date(vehicle.purchaseDate).toLocaleDateString() : '—'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Purchase Price</label>
                <p className="text-sm text-gray-900">{vehicle.purchasePrice ? `$${Number(vehicle.purchasePrice).toLocaleString()}` : '—'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Close
          </button>
          <button
            onClick={() => {
              onEdit(vehicle);
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Edit Vehicle
          </button>
        </div>
      </div>
    </div>
  );
}