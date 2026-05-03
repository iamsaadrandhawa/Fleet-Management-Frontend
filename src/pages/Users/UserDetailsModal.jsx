import { User, X } from 'lucide-react';

export default function UserDetailsModal({ user, onClose, onEdit, getRoleBadge, getStatusBadge, getPermissionsForRole }) {
  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">User Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User size={32} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
              <p className="text-gray-500">{user.userId}</p>
              <div className="flex gap-2 mt-1">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadge(user.role)}`}>
                  {user.role}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(user.status)}`}>
                  {user.status}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Email</label>
              <p className="text-sm text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Phone</label>
              <p className="text-sm text-gray-900">{user.phone}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Department</label>
              <p className="text-sm text-gray-900">{user.department}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Location</label>
              <p className="text-sm text-gray-900">{user.location}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Joining Date</label>
              <p className="text-sm text-gray-900">{user.joiningDate}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Last Login</label>
              <p className="text-sm text-gray-900">{user.lastLogin || 'Never'}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-gray-500">Permissions</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {getPermissionsForRole(user.role).map(perm => (
                  <span key={perm} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                    {perm}
                  </span>
                ))}
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
              onEdit(user);
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Edit User
          </button>
        </div>
      </div>
    </div>
  );
}