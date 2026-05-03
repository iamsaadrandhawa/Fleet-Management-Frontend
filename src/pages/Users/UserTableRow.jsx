import { Eye, Edit, Trash2, User } from 'lucide-react';

export default function UserTableRow({ user, onView, onEdit, onDelete, getRoleBadge, getStatusBadge, toggleUserStatus }) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User size={16} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.userId}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div>
          <p className="text-sm text-gray-600">{user.email}</p>
          <p className="text-xs text-gray-400">{user.phone}</p>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadge(user.role)}`}>
          {user.role}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <p className="text-sm text-gray-600">{user.department}</p>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={() => toggleUserStatus(user)}
          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(user.status)} hover:opacity-80 transition`}
        >
          {user.status}
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <p className="text-xs text-gray-500">{user.lastLogin || 'Never'}</p>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onView(user)}
            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => onEdit(user)}
            className="p-1 text-green-600 hover:bg-green-100 rounded transition"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(user)}
            className="p-1 text-red-600 hover:bg-red-100 rounded transition"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}