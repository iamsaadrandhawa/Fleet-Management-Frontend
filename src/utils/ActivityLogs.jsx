// ActivityLogs.jsx - REPLACE YOUR SECOND FILE WITH THIS

import { useState, useEffect, useCallback } from 'react';
import { Activity, RefreshCw, Trash2, Clock, Trash, Eye, ChevronRight, Filter, X, Search, ChevronLeft, Calendar, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useLogStore from '../stores/logStore';
import useLedgerStore from '../stores/ledgerStore';
import useAuthStore from '../stores/authStore';

export default function ActivityLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingLogId, setDeletingLogId] = useState(null);
  
  // Search and Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterAction, setFilterAction] = useState('');
  const [filterEntity, setFilterEntity] = useState('');
  const [filterDesignation, setFilterDesignation] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [itemsPerPage] = useState(20);
  
  // Store methods - USE THE CORRECT ONES
  const { fetchLogs, deleteLog, clearAllLogs } = useLogStore();
  const { designations, fetchDesignations } = useLedgerStore();
  const { user } = useAuthStore();
  
  const isSuperAdmin = user?.role === 'Super Admin' || user?.role === 'Admin';
  
  // Format functions (same as Dashboard)
  const formatLogFromDB = (dbLog) => {
    return {
      id: dbLog._id || dbLog.id,
      action: dbLog.action || 'UNKNOWN',
      userName: dbLog.userName || dbLog.userEmail || dbLog.user?.name || 'System',
      userEmail: dbLog.userEmail || '',
      userRole: dbLog.userRole || dbLog.user?.role || 'User',
      entityType: dbLog.module || dbLog.entityType || 'SYSTEM',
      details: dbLog.changes || dbLog.details || {},
      description: dbLog.description || '',
      timestamp: dbLog.timestamp || dbLog.createdAt,
      formattedTime: formatTimestamp(dbLog.timestamp || dbLog.createdAt)
    };
  };
  
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
  
  // Load logs - USING fetchLogs (NOT fetchAllLogs)
  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchLogs(currentPage, { limit: itemsPerPage });
      console.log('Loaded logs:', result);
      
      if (result && result.data && result.data.length > 0) {
        const formattedLogs = result.data.map(formatLogFromDB);
        setLogs(formattedLogs);
        setFilteredLogs(formattedLogs);
        setTotalPages(result.pages || 1);
        setTotalLogs(result.total || result.data.length);
      } else {
        setLogs([]);
        setFilteredLogs([]);
        setTotalPages(1);
        setTotalLogs(0);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
      setLogs([]);
      setFilteredLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchLogs, currentPage, itemsPerPage]);
  
  // Apply filters
  useEffect(() => {
    let filtered = [...logs];
    
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterAction) {
      filtered = filtered.filter(log => log.action === filterAction);
    }
    
    if (filterEntity) {
      filtered = filtered.filter(log => log.entityType === filterEntity);
    }
    
    if (filterDesignation) {
      filtered = filtered.filter(log => log.userRole === filterDesignation);
    }
    
    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(log => new Date(log.timestamp) >= fromDate);
    }
    
    if (filterDateTo) {
      const toDate = new Date(filterDateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(log => new Date(log.timestamp) <= toDate);
    }
    
    setFilteredLogs(filtered);
    setCurrentPage(1);
  }, [logs, searchTerm, filterAction, filterEntity, filterDesignation, filterDateFrom, filterDateTo]);
  
  // Initial load
  useEffect(() => {
    loadLogs();
    if (fetchDesignations) fetchDesignations();
  }, [loadLogs, fetchDesignations]);
  
  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterAction('');
    setFilterEntity('');
    setFilterDesignation('');
    setFilterDateFrom('');
    setFilterDateTo('');
  };
  
  // Refresh logs
  const refreshLogs = async () => {
    await loadLogs();
  };
  
  // Delete single log
  const handleDeleteLog = async (logId) => {
    if (!isSuperAdmin) {
      alert('Only Super Admin can delete logs!');
      return;
    }
    
    if (confirm('Are you sure you want to delete this log entry?')) {
      setDeletingLogId(logId);
      try {
        await deleteLog(logId);
        await loadLogs();
        alert('Log deleted successfully!');
      } catch (error) {
        console.error('Error deleting log:', error);
        alert('Failed to delete log');
      } finally {
        setDeletingLogId(null);
      }
    }
  };
  
  // Clear all logs
  const handleClearAllLogs = async () => {
    if (!isSuperAdmin) {
      alert('Only Super Admin can clear all logs!');
      return;
    }
    
    if (confirm('⚠️ Are you sure you want to clear ALL logs? This action cannot be undone!')) {
      try {
        await clearAllLogs();
        await loadLogs();
        alert('All logs cleared successfully!');
      } catch (error) {
        console.error('Error clearing logs:', error);
        alert('Failed to clear logs');
      }
    }
  };
  
  // Export logs
  const exportLogs = () => {
    const data = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  // Stats
  const stats = {
    total: totalLogs,
    last7Days: logs.filter(log => {
      const daysDiff = (new Date() - new Date(log.timestamp)) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    }).length,
    uniqueActions: [...new Set(logs.map(log => log.action))].length,
    uniqueEntities: [...new Set(logs.map(log => log.entityType))].length,
  };
  
  // Badge colors
  const getActionBadgeColor = (action) => {
    switch(action) {
      case 'CREATE': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'LOGIN': return 'bg-purple-100 text-purple-800';
      case 'LOGOUT': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getEntityBadgeColor = (entityType) => {
    switch(entityType) {
      case 'DRIVER': return 'bg-cyan-100 text-cyan-800';
      case 'VEHICLE': return 'bg-indigo-100 text-indigo-800';
      case 'USER': return 'bg-pink-100 text-pink-800';
      case 'AUTH': return 'bg-purple-100 text-purple-800';
      case 'ROLE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getDesignationBadgeColor = (designation) => {
    switch(designation?.toLowerCase()) {
      case 'super admin': return 'bg-red-100 text-red-800';
      case 'admin': return 'bg-orange-100 text-orange-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  const paginationTotalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  
  if (isLoading && logs.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading activity logs...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header Actions */}
     
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Total Logs</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Last 7 Days</p>
          <p className="text-2xl font-bold text-gray-900">{stats.last7Days}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Unique Actions</p>
          <p className="text-2xl font-bold text-gray-900">{stats.uniqueActions}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Unique Entities</p>
          <p className="text-2xl font-bold text-gray-900">{stats.uniqueEntities}</p>
        </div>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by user, email, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex text-xs items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition bg-white"
            >
              <Filter size={12} />
              Filters
              {(filterAction || filterEntity || filterDesignation || filterDateFrom || filterDateTo) && (
                <span className="bg-blue-600 text-white text-[10px] rounded-full px-1.5 py-0.5">
                  Active
                </span>
              )}
            </button>
             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
        <div className="flex gap-2">
          <button
            onClick={refreshLogs}
            className="flex text-xs items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={exportLogs}
            className="flex text-xs items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            <Download size={12} />
            Export
          </button>
          {isSuperAdmin && (
           <button
                  onClick={handleClearAllLogs}
                  className="px-3 py-1.5 text-xs bg-red-50 text-red-600 border border-red-300 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash size={14} className="inline mr-1" />
                  Clear All
                </button>
          )}
        </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Action Type</label>
                  <select
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
                  >
                    <option value="">All Actions</option>
                    {['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW'].map(action => (
                      <option key={action} value={action}>{action}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Entity Type</label>
                  <select
                    value={filterEntity}
                    onChange={(e) => setFilterEntity(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
                  >
                    <option value="">All Entities</option>
                    {['USER', 'DRIVER', 'VEHICLE', 'AUTH', 'ROLE', 'SYSTEM'].map(entity => (
                      <option key={entity} value={entity}>{entity}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Designation</label>
                  <select
                    value={filterDesignation}
                    onChange={(e) => setFilterDesignation(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
                  >
                    <option value="">All Designations</option>
                    {designations?.map(d => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date From</label>
                  <input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date To</label>
                  <input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
    
      
      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 ">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
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
                          {log.userName?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{log.userName}</p>
                        <p className="text-xs text-gray-500">{log.userEmail}</p>
                      </div>
                    </div>
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDesignationBadgeColor(log.userRole)}`}>
                      {log.userRole || 'User'}
                    </span>
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEntityBadgeColor(log.entityType)}`}>
                      {log.entityType}
                    </span>
                   </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 max-w-md truncate" title={log.description}>
                      {log.description || '-'}
                    </div>
                   </td>
                  {isSuperAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        disabled={deletingLogId === log.id}
                        className="p-1 text-red-600 hover:bg-red-100 rounded transition disabled:opacity-50"
                        title="Delete Log"
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
        </div>
        
        {/* Empty State */}
        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <Activity size={48} className="text-gray-300 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-900">No logs found</h3>
            <p className="text-xs text-gray-500 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {paginationTotalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm text-gray-600">
            Page {currentPage} of {paginationTotalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, paginationTotalPages))}
            disabled={currentPage === paginationTotalPages}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
      
      {/* Back to Dashboard */}
      <div className="flex justify-center">
         {/* Results Count */}
      <div className="text-sm text-gray-500">
        Showing {currentLogs.length} of {filteredLogs.length} logs
      </div>
      </div>
    </div>
  );
}