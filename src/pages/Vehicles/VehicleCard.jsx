import { Eye, Edit, Trash2, Car } from 'lucide-react';

export default function VehicleCard({ vehicle, onView, onEdit, onDelete, getStatusBadge }) {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-lg transition">
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
          onClick={() => onView(vehicle)}
          className="p-1 text-blue-600 hover:bg-blue-100 rounded transition"
          title="View Details"
        >
          <Eye size={18} />
        </button>
        <button
          onClick={() => onEdit(vehicle)}
          className="p-1 text-green-600 hover:bg-green-100 rounded transition"
          title="Edit"
        >
          <Edit size={18} />
        </button>
        <button
          onClick={() => onDelete(vehicle)}
          className="p-1 text-red-600 hover:bg-red-100 rounded transition"
          title="Delete"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}