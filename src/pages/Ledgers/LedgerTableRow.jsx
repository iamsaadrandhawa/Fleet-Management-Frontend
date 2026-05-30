import { Edit, Trash2, Check, X } from 'lucide-react';

export default function LedgerTableRow({ 
  item, 
  onEdit, 
  onDelete, 
  showStatus, 
  showPermissions,
  getStatusBadgeColor 
}) {
  
  // Alternative: Detailed permissions grid
  const renderDetailedPermissions = () => {
    if (!item.permissions) return null;
    
    const permissions = [
      { key: 'create', label: 'C', title: 'Create', color: 'text-green-600' },
      { key: 'read', label: 'R', title: 'Read', color: 'text-blue-600' },
      { key: 'update', label: 'U', title: 'Update', color: 'text-yellow-600' },
      { key: 'delete', label: 'D', title: 'Delete', color: 'text-red-600' }
    ];
    
    return (
      <div className="flex gap-2">
        {permissions.map((perm) => (
          <div key={perm.key} className="flex flex-col items-center" title={`${perm.title}: ${item.permissions[perm.key] ? 'Allowed' : 'Denied'}`}>
            <span className={`text-xs font-bold ${perm.color}`}>{perm.label}</span>
            {item.permissions[perm.key] ? (
              <Check size={12} className="text-green-500" />
            ) : (
              <X size={12} className="text-red-400" />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="px-6 py-4 whitespace-nowrap">
        <p className="text-sm font-medium text-gray-900">{item.name}</p>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{item.code}</code>
      </td>
      
      {/* Permissions column */}
      {showPermissions && (
        <td className="px-6 py-4 whitespace-nowrap">
          {renderDetailedPermissions()}
        </td>
      )}
      
      <td className="px-6 py-4">
        <p className="text-sm text-gray-600 max-w-md truncate" title={item.description}>
          {item.description || '-'}
        </p>
      </td>
      
      {showStatus && (
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeColor(item.status)}`}>
            {item.status || 'Active'}
          </span>
        </td>
      )}
      
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onEdit(item)}
            className="p-1 text-green-600 hover:bg-green-100 rounded transition"
            title="Edit Role"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1 text-red-600 hover:bg-red-100 rounded transition"
            title="Delete Role"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}