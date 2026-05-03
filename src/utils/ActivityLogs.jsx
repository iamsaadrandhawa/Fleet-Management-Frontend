import { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, Download, RefreshCw, Trash2, Users, Car, UserCog, Clock } from 'lucide-react';
import useLogStore from '../stores/logStore';
import useLedgerStore from '../stores/ledgerStore';
import useAuthStore from '../stores/authStore';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter states
  const [filterAction, setFilterAction] = useState('');
  const [filterEntity, setFilterEntity] = useState('');
  const [filterDesignation, setFilterDesignation] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Get data from stores
  const { getAllLogs, fetchAllLogs, clearAllLogs, deleteLog, getLogsStats } = useLogStore();
  const { designations, fetchDesignations } = useLedgerStore();
  const { user } = useAuthStore();

  // Check if user is Super Admin
  const isSuperAdmin = user?.role === 'Super Admin';

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    byAction: {},
    byEntity: {},
    last7Days: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, searchTerm, filterAction, filterEntity, filterDesignation, filterDateFrom, filterDateTo]);

  const loadData = async () => {
    setIsLoading(true);
    await fetchAllLogs();
    if (fetchDesignations) fetchDesignations();
    const allLogs = getAllLogs();
    setLogs(allLogs);
    const logsStats = getLogsStats();
    setStats(logsStats);
    setIsLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...logs];

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityId?.toString().includes(searchTerm)
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
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterAction('');
    setFilterEntity('');
    setFilterDesignation('');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const refreshLogs = async () => {
    setIsLoading(true);
    await loadData();
    setIsLoading(false);
  };

  const handleDeleteLog = async (logId) => {
    if (!isSuperAdmin) {
      alert('Only Super Admin can delete logs!');
      return;
    }
    
    if (confirm('Are you sure you want to delete this log entry?')) {
      await deleteLog(logId);
      await loadData();
      alert('Log deleted successfully!');
    }
  };

  const handleClearAllLogs = async () => {
    if (!isSuperAdmin) {
      alert('Only Super Admin can clear all logs!');
      return;
    }
    
    if (confirm('Are you sure you want to clear ALL logs? This action cannot be undone!')) {
      await clearAllLogs();
      await loadData();
      alert('All logs cleared successfully!');
    }
  };

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

  const getEntityBadgeColor = (entityType) => {
    switch(entityType) {
      case 'DRIVER': return 'bg-cyan-100 text-cyan-800';
      case 'VEHICLE': return 'bg-indigo-100 text-indigo-800';
      case 'USER': return 'bg-pink-100 text-pink-800';
      case 'AUTH': return 'bg-purple-100 text-purple-800';
      case 'DESIGNATION': return 'bg-yellow-100 text-yellow-800';
      case 'LOCATION': return 'bg-lime-100 text-lime-800';
      case 'MAKE': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDesignationBadgeColor = (designation) => {
    switch(designation?.toLowerCase()) {
      case 'super admin': return 'bg-red-100 text-red-800';
      case 'admin': return 'bg-orange-100 text-orange-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'senior driver': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEntityIcon = (entityType) => {
    switch(entityType) {
      case 'DRIVER': return <Users size={14} />;
      case 'VEHICLE': return <Car size={14} />;
      case 'USER': return <UserCog size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const uniqueActions = [...new Set(logs.map(log => log.action))];
  const uniqueEntities = [...new Set(logs.map(log => log.entityType))];
  const uniqueDesignations = designations?.map(d => d.name) || [];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  if (isLoading) {
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
        <div className="flex gap-2">
          <button
            onClick={refreshLogs}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            onClick={exportLogs}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            <Download size={16} />
            Export
          </button>
          {isSuperAdmin && (
            <button
              onClick={handleClearAllLogs}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              <Trash2 size={16} />
              Clear All
            </button>
          )}
        </div>
      </div>

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
          <p className="text-2xl font-bold text-gray-900">{Object.keys(stats.byAction).length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Unique Entities</p>
          <p className="text-2xl font-bold text-gray-900">{Object.keys(stats.byEntity).length}</p>
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
                placeholder="Search by user, email, or entity name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition bg-white"
            >
              <Filter size={14} />
              Filters
              {(filterAction || filterEntity || filterDesignation || filterDateFrom || filterDateTo) && (
                <span className="bg-blue-600 text-white text-[10px] rounded-full px-1.5 py-0.5">
                  Active
                </span>
              )}
            </button>
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
                    {uniqueActions.map(action => (
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
                    {uniqueEntities.map(entity => (
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
                    {uniqueDesignations.map(designation => (
                      <option key={designation} value={designation}>{designation}</option>
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

      {/* Results Count */}
      <div className="text-sm text-gray-500">
        Showing {currentLogs.length} of {filteredLogs.length} logs
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                {isSuperAdmin && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                )}
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
                    <div className="flex items-center gap-2">
                      {getEntityIcon(log.entityType)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEntityBadgeColor(log.entityType)}`}>
                        {log.entityType}
                      </span>
                    </div>
                   </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 max-w-md">
                      {log.entityType === 'DRIVER' && (
                        <>Driver: <span className="font-medium">{log.details?.name}</span> ({log.details?.employeeId})</>
                      )}
                      {log.entityType === 'VEHICLE' && (
                        <>Vehicle: <span className="font-medium">{log.details?.make} {log.details?.model}</span> ({log.details?.registrationNumber})</>
                      )}
                      {log.entityType === 'USER' && (
                        <>User: <span className="font-medium">{log.details?.name}</span> ({log.details?.email})</>
                      )}
                      {log.entityType === 'AUTH' && (
                        <>{log.action === 'LOGIN' ? 'Login' : 'Logout'}: <span className="font-medium">{log.details?.email}</span></>
                      )}
                      {log.entityType === 'DESIGNATION' && (
                        <>Designation: <span className="font-medium">{log.details?.name}</span> ({log.details?.code})</>
                      )}
                      {log.entityType === 'LOCATION' && (
                        <>Location: <span className="font-medium">{log.details?.name}</span></>
                      )}
                      {!log.details && <>ID: {log.entityId}</>}
                    </div>
                   </td>
                  {isSuperAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded transition"
                        title="Delete Log"
                      >
                        <Trash2 size={16} />
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
            <div className="text-gray-400 mb-2">📋</div>
            <h3 className="text-sm font-medium text-gray-900">No logs found</h3>
            <p className="text-xs text-gray-500 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}