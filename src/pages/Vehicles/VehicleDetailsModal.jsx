import { Car, X } from 'lucide-react';

export default function VehicleDetailsModal({ vehicle, onClose, onEdit, getStatusBadge }) {
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
              <h3 className="text-xl font-semibold text-gray-900">{vehicle.make} {vehicle.model}</h3>
              <p className="text-gray-500">{vehicle.vehicleId}</p>
              <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(vehicle.status)}`}>
                {vehicle.status}
              </span>
            </div>
          </div>

          {/* Two Column Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700 border-b pb-1">Basic Information</h4>
              <div><label className="text-xs text-gray-500">Vehicle ID</label><p className="text-sm text-gray-900">{vehicle.vehicleId}</p></div>
              <div><label className="text-xs text-gray-500">Registration Number</label><p className="text-sm text-gray-900">{vehicle.registrationNumber}</p></div>
              <div><label className="text-xs text-gray-500">Make</label><p className="text-sm text-gray-900">{vehicle.make}</p></div>
              <div><label className="text-xs text-gray-500">Model</label><p className="text-sm text-gray-900">{vehicle.model}</p></div>
              <div><label className="text-xs text-gray-500">Year</label><p className="text-sm text-gray-900">{vehicle.year}</p></div>
              <div><label className="text-xs text-gray-500">Color</label><p className="text-sm text-gray-900">{vehicle.color}</p></div>
              <div><label className="text-xs text-gray-500">Vehicle Category</label><p className="text-sm text-gray-900">{vehicle.vehicleCategory}</p></div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700 border-b pb-1">Technical Specifications</h4>
              <div><label className="text-xs text-gray-500">Fuel Type</label><p className="text-sm text-gray-900">{vehicle.fuelType}</p></div>
              <div><label className="text-xs text-gray-500">Transmission</label><p className="text-sm text-gray-900">{vehicle.transmission}</p></div>
              <div><label className="text-xs text-gray-500">Seating Capacity</label><p className="text-sm text-gray-900">{vehicle.seatingCapacity}</p></div>
              <div><label className="text-xs text-gray-500">Chassis Number</label><p className="text-sm text-gray-900">{vehicle.chassisNumber}</p></div>
              <div><label className="text-xs text-gray-500">Engine Number</label><p className="text-sm text-gray-900">{vehicle.engineNumber}</p></div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700 border-b pb-1">Registration & Documents</h4>
              <div><label className="text-xs text-gray-500">Registration Date</label><p className="text-sm text-gray-900">{vehicle.registrationDate}</p></div>
              <div><label className="text-xs text-gray-500">Insurance Expiry</label><p className="text-sm text-gray-900">{vehicle.insuranceExpiry}</p></div>
              <div><label className="text-xs text-gray-500">Fitness Expiry</label><p className="text-sm text-gray-900">{vehicle.fitnessExpiry}</p></div>
              <div><label className="text-xs text-gray-500">Pollution Expiry</label><p className="text-sm text-gray-900">{vehicle.pollutionExpiry}</p></div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700 border-b pb-1">Assignment & Purchase</h4>
              <div><label className="text-xs text-gray-500">Assigned Driver</label><p className="text-sm text-gray-900">{vehicle.assignedDriver || 'Not Assigned'}</p></div>
              <div><label className="text-xs text-gray-500">Purchase Date</label><p className="text-sm text-gray-900">{vehicle.purchaseDate}</p></div>
              <div><label className="text-xs text-gray-500">Purchase Price</label><p className="text-sm text-gray-900">${vehicle.purchasePrice}</p></div>
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