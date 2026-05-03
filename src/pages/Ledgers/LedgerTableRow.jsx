import { Edit, Trash2 } from 'lucide-react';

export default function LedgerTableRow({ 
  item, 
  onEdit, 
  onDelete, 
  showStatus, 
  getStatusBadgeColor 
}) {
  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="px-6 py-4 whitespace-nowrap">
        <p className="text-sm font-medium text-gray-900">{item.name}</p>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{item.code}</code>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-gray-600">{item.description || '-'}</p>
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
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1 text-red-600 hover:bg-red-100 rounded transition"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}