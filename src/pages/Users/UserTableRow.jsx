// components/Users/UserTableRow.jsx
import React from 'react';
import { Eye, Edit, Trash2, Power } from 'lucide-react';

export default function UserTableRow({
    user,
    onView,
    onEdit,
    onDelete,
    toggleUserStatus
}) {
    // Get role name safely
    const roleName = user.roleName || user.roleId?.name || user.role || 'N/A';

    // Get designation name safely
    const designationName = user.designationName || user.designationId?.name || 'N/A';

    // Get full name
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();

    return (
        <tr className="hover:bg-gray-50 transition">
            {/* Employee ID Column */}
            <td className="px-6 py-4 whitespace-nowrap">
                <p className="text-sm font-medium text-gray-900">{user.employeeId || 'N/A'}</p>
            </td>

            {/* User Name Column */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">{fullName}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                </div>
            </td>

            {/* Contact Column */}
            <td className="px-6 py-4">
                <p className="text-sm text-gray-900">{user.phone || 'N/A'}</p>

            </td>


            {/* Role Column */}
            <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {roleName}
                </span>
            </td>

            {/* Department Column */}
            <td className="px-6 py-4">
                <p className="text-sm text-gray-600">{user.department || 'N/A'}</p>

            </td>

            {/* Status Column */}
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>

            {/* Last Login Column */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
            </td>

            {/* Actions Column */}
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
                        title="Edit User"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={() => toggleUserStatus(user)}
                        className={`p-1 rounded transition ${user.isActive
                                ? 'text-orange-600 hover:bg-orange-100'
                                : 'text-green-600 hover:bg-green-100'
                            }`}
                        title={user.isActive ? 'Deactivate User' : 'Activate User'}
                    >
                        <Power size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(user)}  // ✅ Pass the whole user object
                        className="p-1 text-red-600 hover:bg-red-100 rounded transition"
                        title="Delete User"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
}