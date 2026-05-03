import { useState } from 'react';
import { Eye, Edit, Trash2, User, Mail, Phone, Shield, Search, Filter, X, Plus, Calendar, MapPin, Briefcase } from 'lucide-react';

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

  const [users, setUsers] = useState([
    { 
      id: 1,
      userId: 'USR-001',
      name: 'Super Admin',
      email: 'superadmin@fleet.com',
      phone: '+92 300 1111111',
      role: 'super_admin',
      status: 'Active',
      department: 'Management',
      location: 'Head Office',
      joiningDate: '2023-01-01',
      lastLogin: '2024-01-15 10:30 AM',
      permissions: ['create', 'read', 'update', 'delete', 'manage_users'],
      profilePicture: null,
    },
    { 
      id: 2,
      userId: 'USR-002',
      name: 'Admin User',
      email: 'admin@fleet.com',
      phone: '+92 300 2222222',
      role: 'admin',
      status: 'Active',
      department: 'Management',
      location: 'Head Office',
      joiningDate: '2023-03-15',
      lastLogin: '2024-01-14 03:45 PM',
      permissions: ['create', 'read', 'update', 'delete'],
      profilePicture: null,
    },
    { 
      id: 3,
      userId: 'USR-003',
      name: 'Fleet Manager',
      email: 'manager@fleet.com',
      phone: '+92 300 3333333',
      role: 'manager',
      status: 'Active',
      department: 'Operations',
      location: 'Karachi',
      joiningDate: '2023-06-10',
      lastLogin: '2024-01-14 11:20 AM',
      permissions: ['create', 'read', 'update'],
      profilePicture: null,
    },
    { 
      id: 4,
      userId: 'USR-004',
      name: 'Data Entry Staff',
      email: 'staff@fleet.com',
      phone: '+92 300 4444444',
      role: 'staff',
      status: 'Active',
      department: 'Data Entry',
      location: 'Lahore',
      joiningDate: '2023-09-20',
      lastLogin: '2024-01-13 09:15 AM',
      permissions: ['create', 'read'],
      profilePicture: null,
    },
    { 
      id: 5,
      userId: 'USR-005',
      name: 'Audit Viewer',
      email: 'viewer@fleet.com',
      phone: '+92 300 5555555',
      role: 'viewer',
      status: 'Inactive',
      department: 'Audit',
      location: 'Islamabad',
      joiningDate: '2023-11-01',
      lastLogin: '2024-01-10 02:00 PM',
      permissions: ['read'],
      profilePicture: null,
    },
  ]);

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

  const getRoleBadge = (role) => {
    switch(role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-orange-100 text-orange-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'staff':
        return 'bg-green-100 text-green-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleName = (role) => {
    switch(role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'manager': return 'Manager';
      case 'staff': return 'Staff';
      case 'viewer': return 'Viewer';
      default: return role;
    }
  };

  const getStatusBadge = (status) => {
    return status === 'Active' 
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  // Get unique values for filters
  const uniqueRoles = ['super_admin', 'admin', 'manager', 'staff', 'viewer'];
  const statuses = ['Active', 'Inactive'];

  // Filter users based on search term and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    
    const matchesRole = !filters.role || user.role === filters.role;
    const matchesStatus = !filters.status || user.status === filters.status;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const clearFilters = () => {
    setFilters({ role: '', status: '' });
    setSearchTerm('');
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
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

  const handleDelete = (user) => {
    if (confirm(`Are you sure you want to delete user ${user.name}? This action cannot be undone.`)) {
      setUsers(users.filter(u => u.id !== user.id));
      console.log('Delete user:', user);
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

  const handleSubmitUser = () => {
    if (validateUserForm()) {
      if (isEditing && selectedUser) {
        // Update existing user
        setUsers(users.map(u => 
          u.id === selectedUser.id 
            ? { ...u, ...newUser, userId: u.userId }
            : u
        ));
        alert('User updated successfully!');
      } else {
        // Add new user
        const newUserId = `USR-${String(users.length + 1).padStart(3, '0')}`;
        setUsers([...users, {
          id: users.length + 1,
          userId: newUserId,
          ...newUser,
          status: 'Active',
          joiningDate: new Date().toISOString().split('T')[0],
          lastLogin: 'Never',
          permissions: getPermissionsForRole(newUser.role),
          profilePicture: null,
        }]);
        alert('User added successfully!');
      }
      setShowAddModal(false);
    }
  };

  const getPermissionsForRole = (role) => {
    switch(role) {
      case 'super_admin': return ['create', 'read', 'update', 'delete', 'manage_users'];
      case 'admin': return ['create', 'read', 'update', 'delete'];
      case 'manager': return ['create', 'read', 'update'];
      case 'staff': return ['create', 'read'];
      case 'viewer': return ['read'];
      default: return ['read'];
    }
  };

  // Function to toggle user status
  const toggleUserStatus = (user) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    if (confirm(`Are you sure you want to ${newStatus === 'Active' ? 'activate' : 'deactivate'} ${user.name}?`)) {
      setUsers(users.map(u => 
        u.id === user.id ? { ...u, status: newStatus } : u
      ));
    }
  };

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Search and Filter Bar */}
      <div className="p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
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
          
          {/* Filter Toggle Button */}
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
          
          {/* Add User Button */}
          <button
            onClick={handleAddUser}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-medium rounded-lg transition flex items-center gap-2"
          >
            <Plus size={14} />
            Add New User
          </button>
        </div>

        {/* Filter Panel */}
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
              {/* Role Filter */}
              <div>
                <label className="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Role</label>
                <select
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
                >
                  <option value="">All Roles</option>
                  {uniqueRoles.map(role => (
                    <option key={role} value={role}>{getRoleName(role)}</option>
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
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
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
                      {getRoleName(user.role)}
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
                    <p className="text-xs text-gray-500">{user.lastLogin}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleViewDetails(user)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded transition"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1 text-green-600 hover:bg-green-100 rounded transition"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      {user.role !== 'super_admin' && (
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
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

      {/* View Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">User Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User size={32} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedUser.name}</h3>
                  <p className="text-gray-500">{selectedUser.userId}</p>
                  <div className="flex gap-2 mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadge(selectedUser.role)}`}>
                      {getRoleName(selectedUser.role)}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(selectedUser.status)}`}>
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500">Email</label>
                  <p className="text-sm text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Phone</label>
                  <p className="text-sm text-gray-900">{selectedUser.phone}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Department</label>
                  <p className="text-sm text-gray-900">{selectedUser.department}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Location</label>
                  <p className="text-sm text-gray-900">{selectedUser.location}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Joining Date</label>
                  <p className="text-sm text-gray-900">{selectedUser.joiningDate}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Last Login</label>
                  <p className="text-sm text-gray-900">{selectedUser.lastLogin}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-gray-500">Permissions</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedUser.permissions.map(perm => (
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
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleEdit(selectedUser);
                  setShowDetailsModal(false);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Edit User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {isEditing ? 'Edit User' : 'Add New User'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Role</option>
                  {uniqueRoles.map(role => (
                    <option key={role} value={role}>{getRoleName(role)}</option>
                  ))}
                </select>
                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                <input
                  type="text"
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <input
                  type="text"
                  value={newUser.location}
                  onChange={(e) => setNewUser({ ...newUser, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
              </div>

              {!isEditing && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                    <input
                      type="password"
                      value={newUser.confirmPassword}
                      onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                  </div>
                </>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitUser}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                {isEditing ? 'Update User' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}
       {/* Results Count */}
      <div className="text-sm text-gray-500">
        Showing {filteredUsers.length} of {users.length} users
      </div>
    </div>
  );
}