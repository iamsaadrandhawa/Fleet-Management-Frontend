import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

const AVAILABLE_TABS = [
  { id: 'dashboard', name: 'Dashboard', path: '/dashboard' },
  { id: 'add-driver', name: 'Add Driver', path: '/add-driver' },
  { id: 'add-vehicle', name: 'Add Vehicle', path: '/add-vehicle' },
  { id: 'driver-list', name: 'Driver List', path: '/driver-list' },
  { id: 'vehicle-list', name: 'Vehicle List', path: '/vehicle-list' },
  { id: 'users', name: 'Users', path: '/users' },
  { id: 'ledgers', name: 'Ledgers', path: '/ledgers' },
  { id: 'settings', name: 'Settings', path: '/settings' },
];

export default function LedgerFormModal({ 
  isEditing, 
  item, 
  tabName,
  tabId,
  onSubmit, 
  onClose 
}) {
  const [name, setName] = useState(item?.name || '');
  const [code, setCode] = useState(item?.code || '');
  const [description, setDescription] = useState(item?.description || '');
  
  const [canCreate, setCanCreate] = useState(item?.permissions?.create || false);
  const [canRead, setCanRead] = useState(item?.permissions?.read || false);
  const [canUpdate, setCanUpdate] = useState(item?.permissions?.update || false);
  const [canDelete, setCanDelete] = useState(item?.permissions?.delete || false);
  
  const [tabDashboard, setTabDashboard] = useState(item?.tabPermissions?.dashboard || false);
  const [tabAddDriver, setTabAddDriver] = useState(item?.tabPermissions?.['add-driver'] || false);
  const [tabAddVehicle, setTabAddVehicle] = useState(item?.tabPermissions?.['add-vehicle'] || false);
  const [tabDriverList, setTabDriverList] = useState(item?.tabPermissions?.['driver-list'] || false);
  const [tabVehicleList, setTabVehicleList] = useState(item?.tabPermissions?.['vehicle-list'] || false);
  const [tabUsers, setTabUsers] = useState(item?.tabPermissions?.users || false);
  const [tabLedgers, setTabLedgers] = useState(item?.tabPermissions?.ledgers || false);
  const [tabSettings, setTabSettings] = useState(item?.tabPermissions?.settings || false);

  const [errors, setErrors] = useState({});
  const isRoleTab = tabId === 'roles';

  // ✅ Super Admin detection — placed INSIDE the component, after state declarations
  const isSuperAdmin = isRoleTab && name.trim().toLowerCase() === 'super admin';

  // ✅ Auto-grant full permissions when the role name is "Super Admin"
  useEffect(() => {
    if (isSuperAdmin) {
      setCanCreate(true);
      setCanRead(true);
      setCanUpdate(true);
      setCanDelete(true);
      setTabDashboard(true);
      setTabAddDriver(true);
      setTabAddVehicle(true);
      setTabDriverList(true);
      setTabVehicleList(true);
      setTabUsers(true);
      setTabLedgers(true);
      setTabSettings(true);
    }
  }, [isSuperAdmin]);

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!code.trim()) newErrors.code = 'Code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const submissionData = {
      name: name.trim(),
      code: code.trim(),
      description: description.trim(),
      permissions: {
        create: canCreate,
        read: canRead,
        update: canUpdate,
        delete: canDelete
      },
      tabPermissions: {
        dashboard: tabDashboard,
        'add-driver': tabAddDriver,
        'add-vehicle': tabAddVehicle,
        'driver-list': tabDriverList,
        'vehicle-list': tabVehicleList,
        users: tabUsers,
        ledgers: tabLedgers,
        settings: tabSettings
      }
    };
    
    console.log('📤 SUBMITTING:', submissionData);
    onSubmit(submissionData);
  };

  const handleSelectAllTabs = () => {
    if (isSuperAdmin) return; // locked
    const allSelected = tabDashboard && tabAddDriver && tabAddVehicle && tabDriverList && 
                        tabVehicleList && tabUsers && tabLedgers && tabSettings;
    const newValue = !allSelected;
    setTabDashboard(newValue);
    setTabAddDriver(newValue);
    setTabAddVehicle(newValue);
    setTabDriverList(newValue);
    setTabVehicleList(newValue);
    setTabUsers(newValue);
    setTabLedgers(newValue);
    setTabSettings(newValue);
  };

  const handleSelectAllCRUD = () => {
    if (isSuperAdmin) return; // locked
    const allSelected = canCreate && canRead && canUpdate && canDelete;
    const newValue = !allSelected;
    setCanCreate(newValue);
    setCanRead(newValue);
    setCanUpdate(newValue);
    setCanDelete(newValue);
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter role name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              {isSuperAdmin && (
                <p className="text-xs text-blue-600 mt-1">
                  ⚡ Super Admin role — full access is granted automatically and can't be changed here.
                </p>
              )}
            </div>
            
            {/* Code Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                  errors.code ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter unique code"
              />
              {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
            </div>

            {/* Permissions Section - Only for Roles Tab */}
            {isRoleTab && (
              <>
                {/* CRUD Permissions */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      CRUD Permissions
                    </label>
                    <button
                      type="button"
                      onClick={handleSelectAllCRUD}
                      disabled={isSuperAdmin}
                      className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {canCreate && canRead && canUpdate && canDelete ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={canCreate}
                        disabled={isSuperAdmin}
                        onChange={(e) => setCanCreate(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded disabled:opacity-70"
                      />
                      <span className="text-sm font-medium text-gray-700">Create</span>
                      <span className="text-xs text-gray-500 ml-auto">Can create new records</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={canRead}
                        disabled={isSuperAdmin}
                        onChange={(e) => setCanRead(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded disabled:opacity-70"
                      />
                      <span className="text-sm font-medium text-gray-700">Read (View)</span>
                      <span className="text-xs text-gray-500 ml-auto">Can view records</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={canUpdate}
                        disabled={isSuperAdmin}
                        onChange={(e) => setCanUpdate(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded disabled:opacity-70"
                      />
                      <span className="text-sm font-medium text-gray-700">Update</span>
                      <span className="text-xs text-gray-500 ml-auto">Can edit records</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={canDelete}
                        disabled={isSuperAdmin}
                        onChange={(e) => setCanDelete(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded disabled:opacity-70"
                      />
                      <span className="text-sm font-medium text-gray-700">Delete</span>
                      <span className="text-xs text-gray-500 ml-auto">Can delete records</span>
                    </label>
                  </div>
                </div>

                {/* Tab Permissions Section */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Tab Access Permissions
                    </label>
                    <button
                      type="button"
                      onClick={handleSelectAllTabs}
                      disabled={isSuperAdmin}
                      className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {tabDashboard && tabAddDriver && tabAddVehicle && tabDriverList && 
                       tabVehicleList && tabUsers && tabLedgers && tabSettings ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={tabDashboard}
                        disabled={isSuperAdmin}
                        onChange={(e) => setTabDashboard(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded disabled:opacity-70"
                      />
                      <span className="text-sm font-medium text-gray-700">Dashboard</span>
                      <span className="text-xs text-gray-500 ml-auto">/dashboard</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={tabAddDriver}
                        disabled={isSuperAdmin}
                        onChange={(e) => setTabAddDriver(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded disabled:opacity-70"
                      />
                      <span className="text-sm font-medium text-gray-700">Add Driver</span>
                      <span className="text-xs text-gray-500 ml-auto">/add-driver</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={tabAddVehicle}
                        disabled={isSuperAdmin}
                        onChange={(e) => setTabAddVehicle(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded disabled:opacity-70"
                      />
                      <span className="text-sm font-medium text-gray-700">Add Vehicle</span>
                      <span className="text-xs text-gray-500 ml-auto">/add-vehicle</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={tabDriverList}
                        disabled={isSuperAdmin}
                        onChange={(e) => setTabDriverList(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded disabled:opacity-70"
                      />
                      <span className="text-sm font-medium text-gray-700">Driver List</span>
                      <span className="text-xs text-gray-500 ml-auto">/driver-list</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={tabVehicleList}
                        disabled={isSuperAdmin}
                        onChange={(e) => setTabVehicleList(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded disabled:opacity-70"
                      />
                      <span className="text-sm font-medium text-gray-700">Vehicle List</span>
                      <span className="text-xs text-gray-500 ml-auto">/vehicle-list</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={tabUsers}
                        disabled={isSuperAdmin}
                        onChange={(e) => setTabUsers(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded disabled:opacity-70"
                      />
                      <span className="text-sm font-medium text-gray-700">Users</span>
                      <span className="text-xs text-gray-500 ml-auto">/users</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={tabLedgers}
                        disabled={isSuperAdmin}
                        onChange={(e) => setTabLedgers(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded disabled:opacity-70"
                      />
                      <span className="text-sm font-medium text-gray-700">Ledgers</span>
                      <span className="text-xs text-gray-500 ml-auto">/ledgers</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={tabSettings}
                        disabled={isSuperAdmin}
                        onChange={(e) => setTabSettings(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded disabled:opacity-70"
                      />
                      <span className="text-sm font-medium text-gray-700">Settings</span>
                      <span className="text-xs text-gray-500 ml-auto">/settings</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Select which tabs/sections this role can access
                  </p>
                </div>
              </>
            )}
            
            {/* Description Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Optional description"
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