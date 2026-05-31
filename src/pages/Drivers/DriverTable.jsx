import { Eye, Edit, Trash2, User } from 'lucide-react';

export default function DriverTable({ 
  drivers, 
  isLoading, 
  onView, 
  onEdit, 
  onDelete, 
  getStatusBadge, 
  getStatusText 
}) {
  
  if (isLoading && drivers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500">Loading drivers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Driver
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CNIC
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Designation
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehicle
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {drivers.map((driver) => (
              <tr key={driver._id} className="hover:bg-gray-50 transition">
                {/* Driver Info with Avatar */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {driver.profilePicture ? (
                        <img 
                          className="h-10 w-10 rounded-full object-cover" 
                          src={driver.profilePicture} 
                          alt={`${driver.firstName} ${driver.lastName}`}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User size={20} className="text-blue-600" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {driver.firstName} {driver.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {driver.email || 'No email'}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Employee ID */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-mono">{driver.employeeId}</div>
                  <div className="text-xs text-gray-500">
                    Joined: {driver.joiningDate ? new Date(driver.joiningDate).toLocaleDateString() : 'N/A'}
                  </div>
                </td>

                {/* Contact */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{driver.phoneNumber}</div>
                  <div className="text-xs text-gray-500">
                    {driver.emergencyContact || 'No emergency contact'}
                  </div>
                </td>

                {/* CNIC */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-mono">{driver.cnic}</div>
                </td>

                {/* Designation */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {driver.designation?.name || driver.designation || 'N/A'}
                  </div>
                </td>

                {/* Location */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {driver.location?.name || driver.location || 'N/A'}
                  </div>
                </td>

                {/* Vehicle Information */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {driver.allocatedVehicle ? (
                    <div>
                      <div className="text-sm text-gray-900">
                        {driver.allocatedVehicle.registrationNumber || driver.allocatedVehicle}
                      </div>
                      {driver.dateOfAllotment && (
                        <div className="text-xs text-gray-500">
                          Since: {new Date(driver.dateOfAllotment).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Not Assigned</span>
                  )}
                </td>

                {/* Status Badge */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(driver.status)}`}>
                    {getStatusText(driver.status)}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onView(driver)}
                    className="text-blue-600 hover:text-blue-900 mr-3 transition"
                    title="View Details"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => onEdit(driver)}
                    className="text-green-600 hover:text-green-900 mr-3 transition"
                    title="Edit Driver"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(driver)}
                    className="text-red-600 hover:text-red-900 transition"
                    title="Delete Driver"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {drivers.length === 0 && (
          <div className="text-center py-12">
            <User size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No drivers found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}