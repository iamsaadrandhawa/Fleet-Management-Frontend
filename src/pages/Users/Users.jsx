import { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, User, Search, Filter, X, Plus } from 'lucide-react';
import useUserStore from '../../stores/userStore';
import useLedgerStore from '../../stores/ledgerStore';
import Logger from '../../utils/Logger';
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
  const { users, addUser, updateUser, deleteUser, fetchUsers } = useUserStore();
  const { designations, fetchDesignations } = useLedgerStore();

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    location: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  // Fetch data on mount
  useEffect(() => {
    fetchUsers();
    if (fetchDesignations) fetchDesignations();
  }, []);

  // Get active designations for roles
  const activeRoles = designations?.filter(d => d.status === 'Active') || [];

  const getRoleBadge = (role) => {
    // Check if role exists in designations
    const foundRole = activeRoles.find(r => r.name === role);
    if (foundRole) {
      // Different colors based on role name
      if (role === 'Super Admin') return 'bg-red-100 text-red-800';
      if (role === 'Admin') return 'bg-orange-100 text-orange-800';
      if (role === 'Manager') return 'bg-blue-100 text-blue-800';
      if (role === 'Staff') return 'bg-green-100 text-green-800';
      if (role === 'Viewer') return 'bg-gray-100 text-gray-800';
      return 'bg-purple-100 text-purple-800';
    }
    return 'bg-gray-100 text-gray-800';
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

  const statuses = ['Active', 'Inactive'];

  // Filter users based on search term and filters
  const filteredUsers = users?.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);
    
    const matchesRole = !filters.role || user.role === filters.role;
    const matchesStatus = !filters.status || user.status === filters.status;
    
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

  const handleEdit = (user) => {
    setIsEditing(true);
    setNewUser({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      department: user.department,
      location: user.location,
      password: '',
      confirmPassword: '',
    });
    setSelectedUser(user);
    setShowAddModal(true);
  };

  const handleDelete = async (user) => {
    if (user.role === 'Super Admin') {
      alert('Super Admin cannot be deleted!');
      return;
    }
    
    if (confirm(`Are you sure you want to delete user ${user.name}? This action cannot be undone.`)) {
      const result = await deleteUser(user.id);
      if (result.success) {
        Logger.deleteUser(user.id, user.name);
        alert('User deleted successfully!');
      } else {
        alert('Error deleting user: ' + (result.error || 'Unknown error'));
      }
    }
  };

  const handleAddUser = () => {
    setIsEditing(false);
    setNewUser({
      name: '',
      email: '',
      phone: '',
      role: '',
      department: '',
      location: '',
      password: '',
      confirmPassword: '',
    });
    setErrors({});
    setShowAddModal(true);
  };

  const validateUserForm = () => {
    const newErrors = {};
    if (!newUser.name) newErrors.name = 'Name is required';
    if (!newUser.email) newErrors.email = 'Email is required';
    if (!newUser.phone) newErrors.phone = 'Phone number is required';
    if (!newUser.role) newErrors.role = 'Role is required';
    if (!newUser.department) newErrors.department = 'Department is required';
    if (!newUser.location) newErrors.location = 'Location is required';
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (newUser.email && !emailPattern.test(newUser.email)) {
      newErrors.email = 'Please enter a valid email address';
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

  const handleSubmitUser = async () => {
    if (validateUserForm()) {
      if (isEditing && selectedUser) {
        const userData = {
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          department: newUser.department,
          location: newUser.location,
        };
        
        const result = await updateUser(selectedUser.id, userData);
        if (result.success) {
          Logger.updateUser({ id: selectedUser.id, ...userData });
          alert('User updated successfully!');
          setShowAddModal(false);
        } else {
          alert('Error updating user: ' + (result.error || 'Unknown error'));
        }
      } else {
        const userData = {
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          department: newUser.department,
          location: newUser.location,
          status: 'Active',
        };
        
        const result = await addUser(userData);
        if (result.success) {
          Logger.createUser({ id: result.user?.id, ...userData });
          alert('User added successfully!');
          setShowAddModal(false);
        } else {
          alert('Error adding user: ' + (result.error || 'Unknown error'));
        }
      }
    }
  };

  const toggleUserStatus = async (user) => {
    if (user.role === 'Super Admin') {
      alert('Super Admin status cannot be changed!');
      return;
    }
    
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    if (confirm(`Are you sure you want to ${newStatus === 'Active' ? 'activate' : 'deactivate'} ${user.name}?`)) {
      const result = await updateUser(user.id, { status: newStatus });
      if (result.success) {
        Logger.updateUser({ id: user.id, name: user.name, status: newStatus });
        alert(`User ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully!`);
      } else {
        alert('Error updating user status');
      }
    }
  };

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Search and Filter Bar */}
      <div className="p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by name, user ID, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition bg-white"
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-medium rounded-lg transition flex items-center gap-2"
          >
            <Plus size={14} />
            Add New User
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[11px] font-medium text-gray-500">FILTER BY:</h3>
              <button
                onClick={clearFilters}
                className="text-[11px] text-red-500 hover:text-red-600 flex items-center gap-1"
              >
                <X size={12} />
                Clear all
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Role Filter - from Ledger Store Designations */}
              <div>
                <label className="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Role</label>
                <select
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
                >
                  <option value="">All Roles</option>
                  {activeRoles.map(role => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
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

      
      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
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
                  key={user.id}
                  user={user}
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