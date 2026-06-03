// VehicleTable.jsx - Shows assigned driver properly
import { Eye, Edit, Trash2, Car, User } from 'lucide-react';

export default function VehicleTable({
  vehicles,
  onView,
  onEdit,
  onDelete,
  getStatusBadge,
}) {
  if (!vehicles || vehicles.length === 0) {
    return null; // Parent handles empty state
  }

  // Helper function to get driver full name from driver object
  const getDriverFullName = (driver) => {
    if (!driver) return '—';
    
    // If driver is a populated object
    if (typeof driver === 'object') {
      const firstName = driver.firstName || '';
      const lastName = driver.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName) return fullName;
      return driver.name || driver.fullName || 'Unknown Driver';
    }
    
    // If driver is just a string ID
    if (typeof driver === 'string') {
      return 'Assigned (ID only)';
    }
    
    return '—';
  };

  // Helper to get assigned driver display
  const getAssignedDriverDisplay = (vehicle) => {
    // Check for assignedTo (populated object)
    if (vehicle.assignedTo) {
      return getDriverFullName(vehicle.assignedTo);
    }
    // Check for assignedDriver (could be object or ID)
    if (vehicle.assignedDriver) {
      if (typeof vehicle.assignedDriver === 'object') {
        return getDriverFullName(vehicle.assignedDriver);
      }
      return vehicle.assignedDriver;
    }
    return '—';
  };

  // Helper to get driver employee ID (for tooltip)
  const getDriverEmployeeId = (vehicle) => {
    const driver = vehicle.assignedTo || vehicle.assignedDriver;
    if (driver && typeof driver === 'object' && driver.employeeId) {
      return driver.employeeId;
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehicle Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Year / Fuel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transmission
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Driver
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vehicles.map((vehicle) => {
              const driverName = getAssignedDriverDisplay(vehicle);
              const driverEmpId = getDriverEmployeeId(vehicle);
              const isAssigned = driverName !== '—';
              
              return (
                <tr
                  key={vehicle._id || vehicle.id}
                  className="hover:bg-gray-50 transition group"
                >
                  {/* Vehicle Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Car size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {vehicle.company || vehicle.make} {vehicle.model}
                        </p>
                        <p className="text-sm text-gray-500">
                          {vehicle.vehicleId || vehicle.vehicleNumber}
                        </p>
                      </div>
                    </div>
                   </td>

                  {/* Registration */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900 font-medium">
                      {vehicle.registrationNumber || '—'}
                    </p>
                  </td>

                  {/* Year / Fuel */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900">{vehicle.year || '—'}</p>
                    <p className="text-xs text-gray-500">
                      {vehicle.fuelType || '—'}
                    </p>
                  </td>

                  {/* Transmission */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900">
                      {vehicle.transmission || '—'}
                    </p>
                  </td>

                  {/* Driver - Shows actual driver name with icon */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isAssigned ? (
                      <div className="flex items-center gap-2 group relative">
                        <User size={14} className="text-green-500 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {driverName}
                          </p>
                          {driverEmpId && (
                            <p className="text-xs text-gray-400">
                              {driverEmpId}
                            </p>
                          )}
                        </div>
                        {/* Tooltip on hover */}
                        <div className="absolute left-0 -top-8 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                          Assigned Driver
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">Not Assigned</p>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                        vehicle.status
                      )}`}
                    >
                      {vehicle.status
                        ? vehicle.status.charAt(0).toUpperCase() +
                          vehicle.status.slice(1)
                        : '—'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => onView(vehicle)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => onEdit(vehicle)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Edit Vehicle"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(vehicle)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Vehicle"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}