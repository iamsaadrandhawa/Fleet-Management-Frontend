import { Eye, Edit, Trash2, User, Car, MapPin, Phone, Mail, Calendar } from 'lucide-react';

export default function DriverCard({ driver, onView, onEdit, onDelete, getStatusBadge }) {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-lg transition">
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
          onClick={() => onView(driver)}
          className="p-1 text-blue-600 hover:bg-blue-100 rounded transition"
          title="View Details"
        >
          <Eye size={18} />
        </button>
        <button
          onClick={() => onEdit(driver)}
          className="p-1 text-green-600 hover:bg-green-100 rounded transition"
          title="Edit"
        >
          <Edit size={18} />
        </button>
        <button
          onClick={() => onDelete(driver)}
          className="p-1 text-red-600 hover:bg-red-100 rounded transition"
          title="Delete"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}