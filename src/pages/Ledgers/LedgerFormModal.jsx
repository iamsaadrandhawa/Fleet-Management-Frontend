import { X } from 'lucide-react';
import { useState } from 'react';

export default function LedgerFormModal({ 
  isEditing, 
  item, 
  tabName,
  tabId, // Add tabId to identify which ledger type
  onSubmit, 
  onClose 
}) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    code: item?.code || '',
    description: item?.description || '',
    permissions: item?.permissions || {
      create: false,
      read: false,
      update: false,
      delete: false
    }
  });

  const [errors, setErrors] = useState({});

  const isRoleTab = tabId === 'roles';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handlePermissionChange = (permission) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [permission]: !formData.permissions[permission]
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.code) newErrors.code = 'Code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // For roles, include permissions in the submission
      if (isRoleTab) {
        onSubmit({
          name: formData.name,
          code: formData.code,
          description: formData.description,
          permissions: formData.permissions
        });
      } else {
        onSubmit(formData);
      }
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-bold text-gray-900">
            {isEditing ? 'Edit' : 'Add'} {tabName}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                name="name"
                placeholder="Enter name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            
            {/* Code Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
              <input
                type="text"
                name="code"
                placeholder="Enter code (e.g., SR-DRV)"
                value={formData.code}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                  errors.code ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
            </div>

            {/* Permissions Section - Only for Roles Tab */}
            {isRoleTab && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CRUD Permissions
                </label>
                <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={formData.permissions.create}
                      onChange={() => handlePermissionChange('create')}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Create</span>
                    <span className="text-xs text-gray-500 ml-auto">Can create new records</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={formData.permissions.read}
                      onChange={() => handlePermissionChange('read')}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Read (View)</span>
                    <span className="text-xs text-gray-500 ml-auto">Can view records</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={formData.permissions.update}
                      onChange={() => handlePermissionChange('update')}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Update</span>
                    <span className="text-xs text-gray-500 ml-auto">Can edit records</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={formData.permissions.delete}
                      onChange={() => handlePermissionChange('delete')}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Delete</span>
                    <span className="text-xs text-gray-500 ml-auto">Can delete records</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Select which operations this role can perform
                </p>
              </div>
            )}
            
            {/* Description Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                placeholder="Optional description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 sticky bottom-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              {isEditing ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}