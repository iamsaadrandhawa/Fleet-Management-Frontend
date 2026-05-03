import { User, X } from 'lucide-react';

export default function DriverDetailsModal({ driver, onClose, onEdit, getStatusBadge }) {
  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Driver Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              {driver.profilePicture ? (
                <img src={driver.profilePicture} alt={driver.fullName} className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <User size={40} className="text-blue-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{driver.fullName}</h3>
              <p className="text-gray-500">{driver.employeeId}</p>
              <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(driver.status)}`}>
                {driver.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Employee ID</label>
              <p className="text-sm text-gray-900">{driver.employeeId}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Full Name</label>
              <p className="text-sm text-gray-900">{driver.fullName}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">CNIC</label>
              <p className="text-sm text-gray-900">{driver.cnic}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Phone Number</label>
              <p className="text-sm text-gray-900">{driver.phoneNumber}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Email</label>
              <p className="text-sm text-gray-900">{driver.email}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Designation</label>
              <p className="text-sm text-gray-900">{driver.designation}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Location</label>
              <p className="text-sm text-gray-900">{driver.location}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Allocated Vehicle</label>
              <p className="text-sm text-gray-900">{driver.allocatedVehicle || 'Not Assigned'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Vehicle Category</label>
              <p className="text-sm text-gray-900">{driver.vehicleCategory}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Date of Allotment</label>
              <p className="text-sm text-gray-900">{driver.dateOfAllotment || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">License Number</label>
              <p className="text-sm text-gray-900">{driver.licenseNumber}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">License Expiry</label>
              <p className="text-sm text-gray-900">{driver.licenseExpiry}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Joining Date</label>
              <p className="text-sm text-gray-900">{driver.joiningDate}</p>
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
              onEdit(driver);
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Edit Driver
          </button>
        </div>
      </div>
    </div>
  );
}