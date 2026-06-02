import { useState, useEffect, useCallback } from 'react';
import { 
  Activity, RefreshCw, Trash2, Filter, X, Calendar, 
  Search, ChevronLeft, ChevronRight, User, Clock,
  Eye, Edit, Plus, LogIn, LogOut, Trash
} from 'lucide-react';
import useLogStore from '../stores/logStore';
import useUserStore from '../stores/userStore';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingLogId, setDeletingLogId] = useState(null);
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [itemsPerPage] = useState(20);
  
  // Filters
  const [filters, setFilters] = useState({
    action: '',
    module: '',
    userRole: '',
    userEmail: '',
    startDate: '',
    endDate: '',
    search: ''
  });
  
  // Store methods
  const { fetchLogs, deleteLog, clearAllLogs, deleteMultipleLogs } = useLogStore();
  const { users, fetchUsers } = useUserStore();
  
  // Get current user for admin check
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
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
  
  // Format log data for display
  const formatLogForDisplay = (log) => {
    return {
      id: log._id || log.id,
      action: log.action || 'UNKNOWN',
      userName: log.userName || log.userEmail || log.user?.name || 'System',
      userEmail: log.userEmail || log.user?.email || '',
      userRole: log.userRole || log.user?.role || 'User',
      entityType: log.module || log.entityType || 'SYSTEM',
      details: log.changes || log.details || {},
      description: log.description || '',
      timestamp: log.timestamp || log.createdAt,
      formattedTime: formatTimestamp(log.timestamp || log.createdAt)
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
  
  // Load logs
  const loadLogs = useCallback(async () => {
    console.log('Loading logs with filters:', filters, 'page:', currentPage);
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchLogs(currentPage, {
        limit: itemsPerPage,
        ...filters
      });
      
      console.log('Fetch logs result:', result);
      
      if (result && result.data && result.data.length > 0) {
        const formattedLogs = result.data.map(formatLogForDisplay);
        setLogs(formattedLogs);
        setTotalPages(result.pages || 1);
        setTotalLogs(result.total || result.data.length);
      } else {
        setLogs([]);
        setTotalPages(1);
        setTotalLogs(0);
      }
    } catch (err) {
      console.error('Error in loadLogs:', err);
      setError(err.message || 'Failed to load logs');
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchLogs, currentPage, itemsPerPage, filters]);
  
  // Load users for filter
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  // Load logs on mount and when dependencies change
  useEffect(() => {
    loadLogs();
  }, [loadLogs]);
  
  // Handle delete single log
  const handleDeleteLog = async (logId) => {
    if (!isAdmin) {
      alert('Only admin users can delete logs');
      return;
    }
    
    setDeletingLogId(logId);
    try {
      await deleteLog(logId);
      await loadLogs();
      setSelectedLogs(selectedLogs.filter(id => id !== logId));
    } catch (error) {
      console.error('Error deleting log:', error);
      alert(error.response?.data?.message || 'Failed to delete log');
    } finally {
      setDeletingLogId(null);
    }
  };
  
  // Handle delete selected logs
  const handleDeleteSelected = async () => {
    if (!isAdmin) {
      alert('Only admin users can delete logs');
      return;
    }
    
    if (selectedLogs.length === 0) {
      alert('No logs selected');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${selectedLogs.length} selected log(s)?`)) {
      setIsLoading(true);
      try {
        await deleteMultipleLogs(selectedLogs);
        await loadLogs();
        setSelectedLogs([]);
        alert(`${selectedLogs.length} log(s) deleted successfully`);
      } catch (error) {
        console.error('Error deleting selected logs:', error);
        alert('Failed to delete some logs');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Handle clear all logs
  const handleClearAllLogs = async () => {
    if (!isAdmin) {
      alert('Only admin users can delete logs');
      return;
    }
    
    if (window.confirm('⚠️ Are you sure you want to delete ALL logs? This action cannot be undone.')) {
      setIsLoading(true);
      try {
        await clearAllLogs();
        await loadLogs();
        setSelectedLogs([]);
        alert('All logs have been cleared successfully');
      } catch (error) {
        console.error('Error clearing logs:', error);
        alert(error.response?.data?.message || 'Failed to clear logs');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Handle select all logs
  const handleSelectAll = () => {
    if (selectedLogs.length === logs.length) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(logs.map(log => log.id));
    }
  };
  
  // Handle select single log
  const handleSelectLog = (logId) => {
    if (selectedLogs.includes(logId)) {
      setSelectedLogs(selectedLogs.filter(id => id !== logId));
    } else {
      setSelectedLogs([...selectedLogs, logId]);
    }
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      action: '',
      module: '',
      userRole: '',
      userEmail: '',
      startDate: '',
      endDate: '',
      search: ''
    });
    setCurrentPage(1);
  };
  
  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1);
    loadLogs();
  };
  
  // Get action badge color
  const getActionBadgeColor = (action) => {
    switch(action?.toUpperCase()) {
      case 'CREATE': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'LOGIN': return 'bg-purple-100 text-purple-800';
      case 'LOGOUT': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch(role?.toLowerCase()) {
      case 'super admin': return 'bg-red-100 text-red-800';
      case 'admin': return 'bg-orange-100 text-orange-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const actionOptions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW'];
  const moduleOptions = ['USER', 'DRIVER', 'VEHICLE', 'AUTH', 'SYSTEM'];
  const roleOptions = ['Super Admin', 'Admin', 'Manager', 'Senior Driver', 'Junior Driver', 'Staff', 'Viewer'];
  
  // Show error if any
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity size={32} className="text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Logs</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadLogs}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity size={24} className="text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {totalLogs > 0 ? `${totalLogs} total logs` : 'No logs found'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Filter size={16} />
                  Filters
                </button>
                
                {isAdmin && logs.length > 0 && (
                  <>
                    {selectedLogs.length > 0 && (
                      <button
                        onClick={handleDeleteSelected}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm bg-yellow-50 text-yellow-700 border border-yellow-300 rounded-lg hover:bg-yellow-100 disabled:opacity-50 flex items-center gap-2"
                      >
                        <Trash2 size={16} />
                        Delete ({selectedLogs.length})
                      </button>
                    )}
                    
                    <button
                      onClick={handleClearAllLogs}
                      disabled={isLoading}
                      className="px-4 py-2 text-sm bg-red-50 text-red-600 border border-red-300 rounded-lg hover:bg-red-100 disabled:opacity-50 flex items-center gap-2"
                    >
                      <Trash size={16} />
                      Clear All
                    </button>
                  </>
                )}
                
                <button
                  onClick={loadLogs}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </div>
          </div>
          
          {/* Filters Panel */}
          {showFilters && (
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Action</label>
                  <select
                    value={filters.action}
                    onChange={(e) => setFilters({...filters, action: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  >
                    <option value="">All</option>
                    {actionOptions.map(action => (
                      <option key={action} value={action}>{action}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Module</label>
                  <select
                    value={filters.module}
                    onChange={(e) => setFilters({...filters, module: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  >
                    <option value="">All</option>
                    {moduleOptions.map(module => (
                      <option key={module} value={module}>{module}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={filters.userRole}
                    onChange={(e) => setFilters({...filters, userRole: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  >
                    <option value="">All</option>
                    {roleOptions.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-end gap-2">
                  <button
                    onClick={applyFilters}
                    className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Apply
                  </button>
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Logs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
                  <p className="text-gray-500">Loading activity logs...</p>
                </div>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-16">
                <Activity size={48} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No activity logs found</p>
                <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or create some activity</p>
              </div>
            ) : (
              <>
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {isAdmin && (
                        <th className="px-4 py-3 w-10">
                          <input
                            type="checkbox"
                            checked={selectedLogs.length === logs.length}
                            onChange={handleSelectAll}
                            className="rounded"
                          />
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Timestamp</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Module</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Details</th>
                      {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        {isAdmin && (
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedLogs.includes(log.id)}
                              onChange={() => handleSelectLog(log.id)}
                              className="rounded"
                            />
                          </td>
                        )}
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                          {log.formattedTime}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getActionBadgeColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-600">
                                {log.userName?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <span className="text-sm text-gray-900">{log.userName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(log.userRole)}`}>
                            {log.userRole}
                          </span>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs bg-gray-100 rounded-full">
                            {log.entityType}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <div className="text-sm text-gray-600 max-w-md truncate">
                            {log.description || 'No details'}
                          </div>
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-3 whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteLog(log.id)}
                              disabled={deletingLogId === log.id}
                              className="text-red-500 hover:text-red-700"
                            >
                              {deletingLogId === log.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                              ) : (
                                <Trash2 size={14} />
                              )}
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-3 border-t bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Page {currentPage} of {totalPages} ({totalLogs} total)
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentPage(p => p - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm border rounded hover:bg-white disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentPage(p => p + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 text-sm border rounded hover:bg-white disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}