import { useState, useEffect, useCallback } from 'react';
import { Users, Car, UserCog, Trash2, Clock, Activity, RefreshCw, Trash, Eye, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useDriverStore from '../../stores/driverStore';
import useVehicleStore from '../../stores/vehicleStore';
import useUserStore from '../../stores/userStore';
import useLedgerStore from '../../stores/ledgerStore';
import useLogStore from '../../stores/logStore';

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedDesignation, setSelectedDesignation] = useState('all');
  const [recentLogs, setRecentLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [deletingLogId, setDeletingLogId] = useState(null);

  // Get data from stores
  const { drivers, fetchDrivers } = useDriverStore();
  const { vehicles, fetchVehicles } = useVehicleStore();
  const { users, fetchUsers } = useUserStore();
  const { designations, fetchDesignations } = useLedgerStore();
  const { fetchLogs, deleteLog, clearAllLogs } = useLogStore();

  // Get current user from localStorage to check if admin
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user;
      }
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return { role: payload.role, name: payload.name, email: payload.email };
        } catch (e) {}
      }
    } catch (e) {
      console.error('Failed to get user:', e);
    }
    return null;
  };

  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin' || currentUser?.role === 'admin';

  // Function to load logs from database (only 10 logs)
  const loadRecentLogsFromDB = useCallback(async () => {
    setIsLoadingLogs(true);
    try {
      // Fetch only 10 logs for dashboard
      const result = await fetchLogs(1, { limit: 10 });
      
      if (result && result.data && result.data.length > 0) {
        const formattedLogs = result.data.map(formatLogFromDB);
        setRecentLogs(formattedLogs);
      } else {
        setRecentLogs([]);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
      setRecentLogs([]);
    } finally {
      setIsLoadingLogs(false);
    }
  }, [fetchLogs]);

  // Auto-refresh every 10 seconds (less frequent for dashboard)
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadRecentLogsFromDB();
      }, 10000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, loadRecentLogsFromDB]);

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchDrivers(),
          fetchVehicles(),
          fetchUsers(),
          fetchDesignations ? fetchDesignations() : Promise.resolve()
        ]);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    
    loadData();
    loadRecentLogsFromDB();
  }, []);

  // Handle delete single log
  const handleDeleteLog = async (logId) => {
    if (!isAdmin) {
      alert('Only admin users can delete logs');
      return;
    }
    
    setDeletingLogId(logId);
    try {
      await deleteLog(logId);
      await loadRecentLogsFromDB();
    } catch (error) {
      console.error('Error deleting log:', error);
      alert(error.response?.data?.message || 'Failed to delete log');
    } finally {
      setDeletingLogId(null);
    }
  };

  // Handle clear all logs
  const handleClearAllLogs = async () => {
    if (!isAdmin) {
      alert('Only admin users can delete logs');
      return;
    }
    
    if (window.confirm('⚠️ Are you sure you want to delete ALL logs? This action cannot be undone.')) {
      try {
        await clearAllLogs();
        await loadRecentLogsFromDB();
        alert('All logs have been cleared successfully');
      } catch (error) {
        console.error('Error clearing logs:', error);
        alert(error.response?.data?.message || 'Failed to clear logs');
      }
    }
  };

  // Navigate to activity logs page
  const handleViewAllLogs = () => {
    navigate('/activity-logs');
  };

  // Format database log
  const formatLogFromDB = (dbLog) => {
    return {
      id: dbLog._id || dbLog.id,
      action: dbLog.action || 'UNKNOWN',
      userName: dbLog.userName || dbLog.userEmail || dbLog.user?.name || 'System',
      userRole: dbLog.userRole || dbLog.user?.role || 'User',
      entityType: dbLog.module || dbLog.entityType || 'SYSTEM',
      details: dbLog.changes || dbLog.details || {},
      description: dbLog.description || '',
      timestamp: dbLog.timestamp || dbLog.createdAt,
      formattedTime: formatTimestamp(dbLog.timestamp || dbLog.createdAt)
    };
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Stats
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

  const getActionBadgeColor = (action) => {
    switch(action?.toUpperCase()) {
      case 'CREATE': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'LOGIN': return 'bg-purple-100 text-purple-800';
      case 'LOGOUT': return 'bg-orange-100 text-orange-800';
      case 'VIEW': return 'bg-gray-100 text-gray-800';
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

  const getUniqueDesignations = () => {
    if (designations && designations.length > 0) {
      return designations.map(d => d.name);
    }
    return ['Super Admin', 'Admin', 'Manager', 'Senior Driver', 'Junior Driver', 'Staff', 'Viewer'];
  };

  const filteredLogs = selectedDesignation === 'all' 
    ? recentLogs 
    : recentLogs.filter(log => log.userRole === selectedDesignation);

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Stats Cards */}
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
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity Logs</h2>
                <p className="text-sm text-gray-500">
                  Showing last {recentLogs.length} activities {autoRefresh && '(Auto-refreshing every 10s)'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  autoRefresh ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-600 border border-gray-300'
                }`}
              >
                <RefreshCw size={14} className={`inline mr-1 ${autoRefresh ? 'animate-spin-slow' : ''}`} />
                Auto
              </button>
              
              <button
                onClick={loadRecentLogsFromDB}
                disabled={isLoadingLogs}
                className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {isLoadingLogs ? 'Loading...' : 'Refresh'}
              </button>
              
              {isAdmin && recentLogs.length > 0 && (
                <button
                  onClick={handleClearAllLogs}
                  className="px-3 py-1.5 text-sm bg-red-50 text-red-600 border border-red-300 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash size={14} className="inline mr-1" />
                  Clear All
                </button>
              )}
              
              <select
                value={selectedDesignation}
                onChange={(e) => setSelectedDesignation(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Designations</option>
                {getUniqueDesignations().map((designation) => (
                  <option key={designation} value={designation}>{designation}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {/* Table rows with refresh effect */}
          <div className={`transition-opacity duration-300 ${isLoadingLogs ? 'opacity-50' : 'opacity-100'}`}>
            {filteredLogs.length === 0 && !isLoadingLogs ? (
              <div className="text-center py-12">
                <Activity size={48} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">No activity logs found</p>
                <p className="text-sm text-gray-400 mt-1">Activities will appear here as users interact with the system</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-600">{log.formattedTime}</span>
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
                              {log.userName?.charAt(0)?.toUpperCase() || 'U'}
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
                        <span className="text-sm text-gray-600">{log.entityType}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-md truncate" title={log.description || JSON.stringify(log.details)}>
                          {log.description || (typeof log.details === 'object' ? JSON.stringify(log.details).substring(0, 80) : log.details || 'N/A')}
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteLog(log.id)}
                            disabled={deletingLogId === log.id}
                            className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                            title="Delete log"
                          >
                            {deletingLogId === log.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        
        {/* View All Logs Button - Centered */}
        {filteredLogs.length > 0 && (
          <div className="px-6 py-5 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-center">
              <button
                onClick={handleViewAllLogs}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-md font-medium"
              >
                <Eye size={18} />
                <span>View All Activity Logs</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}