import { useState, useEffect } from 'react';
import { Users, Car, UserCog, Eye, Edit, Trash2, Plus, Clock, Activity } from 'lucide-react';
import useDriverStore from '../../stores/driverStore';
import useVehicleStore from '../../stores/vehicleStore';
import useUserStore from '../../stores/userStore';
import useLedgerStore from '../../stores/ledgerStore';
import useLogStore from '../../stores/logStore';

export default function Dashboard() {
  const [selectedDesignation, setSelectedDesignation] = useState('all');
  const [recentLogs, setRecentLogs] = useState([]);

  // Get data from stores
  const { drivers, fetchDrivers, totalDrivers } = useDriverStore();
  const { vehicles, fetchVehicles, totalVehicles } = useVehicleStore();
  const { users, fetchUsers, totalUsers } = useUserStore();
  const { designations, fetchDesignations } = useLedgerStore();
  const { getAllLogs, getRecentLogs } = useLogStore();

  // Fetch data on component mount
  useEffect(() => {
    fetchDrivers();
    fetchVehicles();
    fetchUsers();
    if (fetchDesignations) fetchDesignations();
    
    // Load recent logs (last 20)
    const logs = getRecentLogs(20);
    setRecentLogs(logs);
  }, []);

  // Stats from store data
  const stats = [
    { 
      title: 'Total Drivers', 
      value: drivers?.length || 0, 
      icon: Users, 
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      link: '/driver-list'
    },
    { 
      title: 'Total Vehicles', 
      value: vehicles?.length || 0, 
      icon: Car, 
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      link: '/vehicle-list'
    },
    { 
      title: 'Total Users', 
      value: users?.length || 0, 
      icon: UserCog, 
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      link: '/users'
    },
  ];

  const getActionIcon = (action) => {
    switch(action) {
      case 'CREATE': return <Plus size={14} className="text-green-600" />;
      case 'UPDATE': return <Edit size={14} className="text-blue-600" />;
      case 'DELETE': return <Trash2 size={14} className="text-red-600" />;
      case 'VIEW': return <Eye size={14} className="text-gray-600" />;
      case 'LOGIN': return <Activity size={14} className="text-purple-600" />;
      case 'LOGOUT': return <Activity size={14} className="text-orange-600" />;
      default: return <Clock size={14} className="text-gray-400" />;
    }
  };

  const getActionBadgeColor = (action) => {
    switch(action) {
      case 'CREATE': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'VIEW': return 'bg-gray-100 text-gray-800';
      case 'LOGIN': return 'bg-purple-100 text-purple-800';
      case 'LOGOUT': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDesignationBadgeColor = (designation) => {
    switch(designation?.toLowerCase()) {
      case 'super admin': return 'bg-red-100 text-red-800';
      case 'admin': return 'bg-orange-100 text-orange-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'senior driver': return 'bg-purple-100 text-purple-800';
      case 'junior driver': return 'bg-cyan-100 text-cyan-800';
      case 'staff': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEntityIcon = (entityType) => {
    switch(entityType) {
      case 'DRIVER': return <Users size={14} className="text-blue-600" />;
      case 'VEHICLE': return <Car size={14} className="text-green-600" />;
      case 'USER': return <UserCog size={14} className="text-purple-600" />;
      default: return <Clock size={14} className="text-gray-400" />;
    }
  };

  // Get unique designations from ledger store for filter dropdown
  const getUniqueDesignations = () => {
    if (designations && designations.length > 0) {
      return designations.map(d => d.name);
    }
    return ['Super Admin', 'Admin', 'Manager', 'Senior Driver', 'Junior Driver', 'Staff', 'Viewer'];
  };

  // Filter logs by designation
  const filteredLogs = selectedDesignation === 'all' 
    ? recentLogs 
    : recentLogs.filter(log => log.userRole === selectedDesignation || log.userName === selectedDesignation);

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      
      {/* Stats Cards Section */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index} 
                onClick={() => window.location.href = stat.link}
                className={`${stat.bgColor} rounded-xl p-6 border border-gray-100 cursor-pointer hover:shadow-md transition-all hover:scale-[1.02]`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-xl bg-white shadow-sm`}>
                    <Icon size={24} className="text-gray-700" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Logs Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Activity size={20} className="text-gray-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity Logs</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Latest system activities and user actions
                </p>
              </div>
            </div>
            
            {/* Designation Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Filter by:</span>
              <select
                value={selectedDesignation}
                onChange={(e) => setSelectedDesignation(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Designations</option>
                {getUniqueDesignations().map((designation) => (
                  <option key={designation} value={designation}>
                    {designation}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Designation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600">{log.formattedTime || log.timestamp}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {log.userName?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{log.userName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDesignationBadgeColor(log.userRole)}`}>
                        {log.userRole || 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getEntityIcon(log.entityType)}
                        <span className="text-sm text-gray-600">{log.entityType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {log.entityType === 'DRIVER' && `Driver: ${log.details?.name || log.details?.employeeId || log.entityId}`}
                        {log.entityType === 'VEHICLE' && `Vehicle: ${log.details?.make} ${log.details?.model || log.entityId}`}
                        {log.entityType === 'USER' && `User: ${log.details?.name || log.entityId}`}
                        {log.entityType === 'AUTH' && `${log.action === 'LOGIN' ? 'Login: ' : 'Logout: '} ${log.details?.email}`}
                        {log.entityType === 'DESIGNATION' && `Designation: ${log.details?.name}`}
                        {log.entityType === 'LOCATION' && `Location: ${log.details?.name}`}
                        {log.entityType === 'MAKE' && `Make: ${log.details?.name}`}
                        {!log.details && `ID: ${log.entityId}`}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Activity size={48} className="text-gray-300" />
                      <p className="text-gray-500">No activity logs found</p>
                      <p className="text-xs text-gray-400">Activities will appear here as users interact with the system</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* View All Logs Button */}
        {filteredLogs.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 text-center">
            <button
              onClick={() => window.location.href = '/activity-logs'}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All Activity Logs →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}