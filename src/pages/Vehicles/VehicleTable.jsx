// VehicleTable.jsx - CORRECT VERSION
import { Eye, Edit, Trash2, Car } from 'lucide-react';

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

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-blue-50 to-gray-50">
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
            {vehicles.map((vehicle) => (
              <tr
                key={vehicle._id || vehicle.id}
                className="hover:bg-gray-50 transition"
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

                {/* Transmission - CORRECT FIELD NAME */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm text-gray-900">
                    {vehicle.transmission || '—'}  {/* ✅ Use 'transmission' (singular) */}
                  </p>
                </td>

                {/* Driver */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm text-gray-900">
                    {vehicle.assignedDriver ||
                      vehicle.assignedTo?.name ||
                      '—'}
                  </p>
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
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(vehicle)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}