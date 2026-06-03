// pages/403.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from '../../stores/authStore';

export default function AccessDenied() {
  const navigate = useNavigate();
  const { accessibleTabs, user, tabPermissions, canAccessTab, refreshPermissions } = useAuthStore();

  useEffect(() => {
    console.log('🔍 403 Page Debug:');
    console.log('  accessibleTabs:', accessibleTabs);
    console.log('  tabPermissions:', tabPermissions);
    console.log('  user:', user);
    console.log('  user.roleName:', user?.roleName);
    console.log('  canAccessTab("dashboard"):', canAccessTab('dashboard'));
    console.log('  canAccessTab("add-driver"):', canAccessTab('add-driver'));
  }, []);

  const handleRefresh = async () => {
    await refreshPermissions();
    window.location.reload();
  };

  const getFirstAccessibleTab = () => {
    const tabOrder = ['add-driver', 'add-vehicle', 'driver-list', 'vehicle-list', 'dashboard', 'users', 'ledgers', 'settings'];
    
    for (const tab of tabOrder) {
      if (accessibleTabs.includes(tab)) {
        return `/${tab}`;
      }
    }
    
    // Also check tabPermissions directly
    if (tabPermissions) {
      for (const [tab, hasAccess] of Object.entries(tabPermissions)) {
        if (hasAccess === true) {
          return `/${tab}`;
        }
      }
    }
    
    return '/login';
  };

  const firstTab = getFirstAccessibleTab();
  const roleName = user?.roleName || user?.role?.name || 'Unknown';
  const accessibleCount = accessibleTabs.length;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-4">
          You don't have permission to access this page.
        </p>
        <p className="text-sm text-gray-500 mb-2">
          Your role: <span className="font-semibold">{roleName}</span>
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Accessible tabs: {accessibleCount} of 8
        </p>
        
        {accessibleTabs.length > 0 && (
          <div className="bg-gray-100 rounded-lg p-3 mb-4">
            <p className="text-xs text-gray-600 mb-1">You can access:</p>
            <div className="flex flex-wrap gap-1 justify-center">
              {accessibleTabs.map(tab => (
                <span key={tab} className="inline-block text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                  {tab}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex gap-3 justify-center">
          {firstTab !== '/login' && (
            <Link
              to={firstTab}
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Go to Available Page
            </Link>
          )}
          <button
            onClick={handleRefresh}
            className="inline-block px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Refresh Permissions
          </button>
        </div>
      </div>
    </div>
  );
}