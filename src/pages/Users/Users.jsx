// pages/Users/Users.jsx
import { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, User, Search, Filter, X, Plus } from 'lucide-react';
import useUserStore from '../../stores/userStore';
import useLedgerStore from '../../stores/ledgerStore';
import Logger from '../../utils/logger';
import UserDetailsModal from '../Users/UserDetailsModal';
import UserFormModal from '../Users/UserFormModal';
import UserTableRow from '../Users/UserTableRow';

export default function Users() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    status: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Get data from stores
  const { users, addUser, updateUser,deactivateUser,activateUser, deleteUser, fetchUsers } = useUserStore();
  const { roles, fetchRoles, designations, fetchDesignations } = useLedgerStore();

  const [newUser, setNewUser] = useState({
  employeeId: '',
  firstName: '',
  lastName: '',
  email: '',
  department: '',
  designationId: '',
  roleId: '',
  phone: '',
  location: '',  // Changed from 'address' to 'location'
  password: '',
  confirmPassword: '',
});

  const [errors, setErrors] = useState({});

  // Fetch data on mount
  useEffect(() => {
    fetchUsers();
    if (fetchRoles) fetchRoles();
    if (fetchDesignations) fetchDesignations();
  }, []);

  // Get active roles from ledger store
  const activeRoles = roles?.filter(r => r.status === 'active') || [];

  const getRoleBadge = (roleName) => {
    if (roleName === 'Super Admin') return 'bg-red-100 text-red-800';
    if (roleName === 'Admin') return 'bg-orange-100 text-orange-800';
    if (roleName === 'Manager') return 'bg-blue-100 text-blue-800';
    if (roleName === 'Staff') return 'bg-green-100 text-green-800';
    if (roleName === 'Viewer') return 'bg-gray-100 text-gray-800';
    return 'bg-purple-100 text-purple-800';
  };

  const getStatusBadge = (status) => {
    return status === 'Active' 
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const getPermissionsForRole = (role) => {
    switch(role) {
      case 'Super Admin': return ['create', 'read', 'update', 'delete', 'manage_users'];
      case 'Admin': return ['create', 'read', 'update', 'delete'];
      case 'Manager': return ['create', 'read', 'update'];
      case 'Staff': return ['create', 'read'];
      case 'Viewer': return ['read'];
      default: return ['read'];
    }
  };
  const toggleUserStatus = async (user) => {
  const userId = user._id || user.id;
  
  console.log('Toggling status for user:', userId);
  console.log('Current isActive:', user.isActive);
  
  if (!userId) {
    alert('Error: User ID not found');
    return;
  }
  
  if (user.roleName === 'Super Admin') {
    alert('Super Admin status cannot be changed!');
    return;
  }
  
  const newStatus = !user.isActive;
  const action = newStatus ? 'activate' : 'deactivate';
  
  console.log('Action:', action);
  
  if (confirm(`Are you sure you want to ${action} ${user.firstName} ${user.lastName}?`)) {
    let result;
    
    if (newStatus) {
      // Activate user
      result = await activateUser(userId);
    } else {
      // Deactivate user
      result = await deactivateUser(userId);
    }
    
    console.log('Result:', result);
    
    if (result.success) {
      alert(`User ${action}d successfully!`);
      fetchUsers(); // Refresh the list
    } else {
      alert(`Error ${action}ing user: ` + (result.error || 'Unknown error'));
    }
  }
};

  const statuses = ['Active', 'Inactive'];

  // Filter users based on search term and filters
  const filteredUsers = users?.filter(user => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = searchTerm === '' || 
      user.employeeId?.toLowerCase().includes(searchLower) ||
      fullName.includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone?.includes(searchTerm);
    
    const matchesRole = !filters.role || user.roleName === filters.role;
    const matchesStatus = !filters.status || (filters.status === 'Active' ? user.isActive : !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  }) || [];

  const clearFilters = () => {
    setFilters({ role: '', status: '' });
    setSearchTerm('');
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
    Logger.viewUser(user);
  };

  // In Users.jsx - Update handleEdit function
const handleEdit = (user) => {
  console.log('Editing user:', user); // Debug log
  console.log('User ID:', user._id || user.id); // Debug log
  
  setIsEditing(true);
  setNewUser({
    employeeId: user.employeeId || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    department: user.department || '',
    designationId: user.designationId?._id || user.designationId || '',
    roleId: user.roleId?._id || user.roleId || '',
    phone: user.phone || '',
    location: user.location || user.address || '',
    password: '',
    confirmPassword: '',
  });
  setSelectedUser(user); // Store the full user object with _id
  setShowAddModal(true);
};

const handleDelete = async (user) => {
  const userId = user._id || user.id;
  
  if (!userId) {
    alert('Error: Cannot delete user - ID not found');
    return;
  }
  
  if (user.roleName === 'Super Admin') {
    alert('Super Admin cannot be deleted!');
    return;
  }
  
  const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  
  if (confirm(`⚠️ WARNING: This will PERMANENTLY DELETE ${userName} from the database!\n\nThis action cannot be undone. Are you ABSOLUTELY sure?`)) {
    const result = await deleteUser(userId);
    if (result.success) {
      alert('User permanently deleted!');
      fetchUsers();
    } else {
      alert('Error deleting user: ' + (result.error || 'Unknown error'));
    }
  }
};

  const handleAddUser = () => {
  setIsEditing(false);
  setNewUser({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    designationId: '',
    roleId: '',
    phone: '',
    location: '',  // Changed from 'address' to 'location'
    password: '',
    confirmPassword: '',
  });
  setErrors({});
  setShowAddModal(true);
};

  const validateUserForm = () => {
   const newErrors = {};
  if (!newUser.employeeId) newErrors.employeeId = 'Employee ID is required';
  if (!newUser.firstName) newErrors.firstName = 'First name is required';
  if (!newUser.lastName) newErrors.lastName = 'Last name is required';
  if (!newUser.email) newErrors.email = 'Email is required';
  if (!newUser.department) newErrors.department = 'Department is required';
  if (!newUser.designationId) newErrors.designationId = 'Designation is required';
  if (!newUser.roleId) newErrors.roleId = 'Role is required';
  if (!newUser.phone) newErrors.phone = 'Phone number is required';
  if (!newUser.location) newErrors.location = 'Location is required';  // Changed to 'location'
  
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (newUser.email && !emailPattern.test(newUser.email)) {
      newErrors.email = 'Please enter a valid email location';
    }
    
    const phonePattern = /^[0-9+\-\s()]{10,15}$/;
    if (newUser.phone && !phonePattern.test(newUser.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!isEditing) {
      if (!newUser.password) newErrors.password = 'Password is required';
      if (newUser.password !== newUser.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (newUser.password && newUser.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // In Users.jsx - Update handleSubmitUser function
const handleSubmitUser = async () => {
  if (validateUserForm()) {
    if (isEditing && selectedUser) {
      const userId = selectedUser._id || selectedUser.id;
      console.log('Updating user with ID:', userId); // Debug log
      
      if (!userId) {
        alert('Error: User ID not found');
        return;
      }
      
      const userData = {
        employeeId: newUser.employeeId,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        department: newUser.department,
        designationId: newUser.designationId,
        roleId: newUser.roleId,
        phone: newUser.phone,
        location: newUser.location,
      };
      
      const result = await updateUser(userId, userData);
      if (result.success) {
        alert('User updated successfully!');
        setShowAddModal(false);
        fetchUsers(); // Refresh the list
      } else {
        alert('Error updating user: ' + (result.error || 'Unknown error'));
      }
    } else {
      // Create new user
      const userData = {
        employeeId: newUser.employeeId,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        department: newUser.department,
        designationId: newUser.designationId,
        roleId: newUser.roleId,
        phone: newUser.phone,
        location: newUser.location,
        password: newUser.password,
        confirmPassword: newUser.confirmPassword,
      };
      
      const result = await addUser(userData);
      if (result.success) {
        alert('User added successfully!');
        setShowAddModal(false);
        fetchUsers();
      } else {
        alert('Error adding user: ' + (result.error || 'Unknown error'));
      }
    }
  }
};

 

  // Format user for display
  const formatUserForTable = (user) => {
    return {
      id: user._id,
      employeeId: user.employeeId,
      name: `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.roleName,
      department: user.department,
      location: user.location,
      status: user.isActive ? 'Active' : 'Inactive',
      lastLogin: user.lastLogin,
      isActive: user.isActive,
    };
  };

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Search and Filter Bar */}
     
<div className="bg-white rounded-lg shadow border border-gray-200">
  <div className="p-4">
    <div className="flex flex-col md:flex-row gap-3">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search by employee ID, name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
        />
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition bg-white"
        >
          <Filter size={14} />
          Filters
          {(filters.role || filters.status) && (
            <span className="bg-blue-600 text-white text-[10px] rounded-full px-1.5 py-0.5">
              Active
            </span>
          )}
        </button>
        
        <button
          onClick={handleAddUser}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium rounded-lg transition flex items-center gap-2"
        >
          <Plus size={14} />
          Add New User
        </button>
      </div>
    </div>
    
    {/* Filter Panel */}
    {showFilters && (
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-700">Filter by:</h3>
          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <X size={14} />
            Clear all
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Role Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
            >
              <option value="">All Roles</option>
              {activeRoles.map(role => (
                <option key={role._id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
            >
              <option value="">All Status</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    )}
  </div>
</div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <UserTableRow
                  key={user._id}
                  user={formatUserForTable(user)}
                  originalUser={user}
                  onView={handleViewDetails}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  getRoleBadge={getRoleBadge}
                  getStatusBadge={getStatusBadge}
                  toggleUserStatus={toggleUserStatus}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <User size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No users found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
          <button
            onClick={clearFilters}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Modals */}
      {showDetailsModal && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setShowDetailsModal(false)}
          onEdit={handleEdit}
          getRoleBadge={getRoleBadge}
          getStatusBadge={getStatusBadge}
          getPermissionsForRole={getPermissionsForRole}
        />
      )}

      {showAddModal && (
        <UserFormModal
          isEditing={isEditing}
          newUser={newUser}
          setNewUser={setNewUser}
          errors={errors}
          activeRoles={activeRoles}
          onSubmit={handleSubmitUser}
          onClose={() => setShowAddModal(false)}
        />
      )}
      
      {/* Results Count */}
      <div className="text-sm text-gray-500 px-4">
        Showing {filteredUsers.length} of {users?.length || 0} users
      </div>
    </div>
  );
}