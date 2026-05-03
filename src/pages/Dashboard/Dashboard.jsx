import { useState, useEffect } from 'react';
import { Users, Car, UserCog, Eye, Edit, Trash2, Plus } from 'lucide-react';
import useDriverStore from '../../stores/driverStore';
import useVehicleStore from '../../stores/vehicleStore';
import useUserStore from '../../stores/userStore';
import useLedgerStore from '../../stores/ledgerStore';

export default function Dashboard() {
  const [selectedDesignation, setSelectedDesignation] = useState('all');

  // Get data from stores
  const { drivers, fetchDrivers } = useDriverStore();
  const { vehicles, fetchVehicles } = useVehicleStore();
  const { users, fetchUsers } = useUserStore();
  const { designations, fetchDesignations } = useLedgerStore();

  // Fetch data on component mount
  useEffect(() => {
    fetchDrivers();
    fetchVehicles();
    fetchUsers();
    if (fetchDesignations) fetchDesignations();
  }, []);

  // Activity logs data with designations instead of roles
  const [activityLogs] = useState([
    {
      id: 1,
      action: 'Created new driver',
      user: 'Super Admin',
      designation: 'Super Admin',
      target: 'Driver: John Doe',
      timestamp: '2024-01-15 10:30 AM',
      type: 'create'
    },
    {
      id: 2,
      action: 'Added new vehicle',
      user: 'Admin',
      designation: 'Admin',
      target: 'Vehicle: Toyota Camry (ABC-123)',
      timestamp: '2024-01-15 09:15 AM',
      type: 'create'
    },
    {
      id: 3,
      action: 'Updated driver information',
      user: 'Manager',
      designation: 'Manager',
      target: 'Driver: Jane Smith',
      timestamp: '2024-01-14 04:45 PM',
      type: 'update'
    },
    {
      id: 4,
      action: 'Deleted vehicle record',
      user: 'Staff',
      designation: 'Staff',
      target: 'Vehicle: Old Ford (XYZ-789)',
      timestamp: '2024-01-14 02:20 PM',
      type: 'delete'
    },
    {
      id: 5,
      action: 'Viewed driver details',
      user: 'Viewer',
      designation: 'Viewer',
      target: 'Driver: Mike Johnson',
      timestamp: '2024-01-14 11:00 AM',
      type: 'view'
    },
    {
      id: 6,
      action: 'Registered new driver',
      user: 'Super Admin',
      designation: 'Super Admin',
      target: 'Driver: Sarah Williams',
      timestamp: '2024-01-13 03:30 PM',
      type: 'create'
    },
    {
      id: 7,
      action: 'Updated vehicle status',
      user: 'Senior Driver',
      designation: 'Senior Driver',
      target: 'Vehicle: Toyota Camry',
      timestamp: '2024-01-13 10:00 AM',
      type: 'update'
    },
  ]);

  // Stats from store data
  const stats = [
    { 
      title: 'Total Drivers', 
      value: drivers?.length || 0, 
      icon: Users, 
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    { 
      title: 'Total Vehicles', 
      value: vehicles?.length || 0, 
      icon: Car, 
      color: 'bg-green-500',
      bgColor: 'bg-green-50'
    },
    { 
      title: 'Total Users', 
      value: users?.length || 0, 
      icon: UserCog, 
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50'
    },
  ];

  const getActionIcon = (type) => {
    switch(type) {
      case 'create': return <Plus size={16} className="text-green-600" />;
      case 'update': return <Edit size={16} className="text-blue-600" />;
      case 'delete': return <Trash2 size={16} className="text-red-600" />;
      case 'view': return <Eye size={16} className="text-gray-600" />;
      default: return null;
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

  // Get unique designations from ledger store for filter dropdown
  const getUniqueDesignations = () => {
    if (designations && designations.length > 0) {
      return designations.map(d => d.name);
    }
    // Fallback designations if store is empty
    return ['Super Admin', 'Admin', 'Manager', 'Senior Driver', 'Junior Driver', 'Staff', 'Viewer'];
  };

  const filteredLogs = selectedDesignation === 'all' 
    ? activityLogs 
    : activityLogs.filter(log => log.designation === selectedDesignation);

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`${stat.bgColor} rounded-xl p-6 border border-gray-100`}>
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

      {/* Activity Logs Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Activity Logs</h2>
              <p className="text-sm text-gray-500 mt-1">
                Track all user activities and changes in the system
              </p>
            </div>
            
            {/* Designation Filter - using data from ledger store */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Filter by designation:</span>
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
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Designation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.type)}
                      <span className="text-sm text-gray-900">{log.action}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{log.user}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDesignationBadgeColor(log.designation)}`}>
                      {log.designation}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{log.target}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{log.timestamp}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No activity logs found</p>
          </div>
        )}
      </div>
    </div>
  );
}