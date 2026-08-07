// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({ children, tabKey }) {
  const { 
    isAuthenticated, 
    isLoading, 
    canAccessTab, 
    accessibleTabs, 
    user,
    refreshPermissions,
    role,
    permissions
  } = useAuthStore();
  
  const [checking, setChecking] = useState(true);

  // Debug logging
  useEffect(() => {
    console.log('🔒 ProtectedRoute Debug:');
    console.log('  tabKey:', tabKey);
    console.log('  isAuthenticated:', isAuthenticated);
    console.log('  isLoading:', isLoading);
    console.log('  accessibleTabs:', accessibleTabs);
    console.log('  user:', user?.email);
    console.log('  user.roleName:', user?.roleName);
    console.log('  role:', role);
    console.log('  permissions:', permissions);
    console.log('  canAccessTab result:', canAccessTab(tabKey));
    
    if (!isLoading && isAuthenticated) {
      setChecking(false);
    }
  }, [isAuthenticated, isLoading, accessibleTabs, user, role, permissions, tabKey]);

  // Try to refresh permissions if we're authenticated but have no tabs
  useEffect(() => {
    if (isAuthenticated && accessibleTabs.length === 0 && !isLoading) {
      console.log('🔄 No accessible tabs found, refreshing permissions...');
      refreshPermissions().then(() => {
        setChecking(false);
      });
    } else if (!isLoading) {
      setChecking(false);
    }
  }, [isAuthenticated, accessibleTabs, isLoading, refreshPermissions]);

  if (isLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Admin/Super Admin bypass - check all possible role name sources
  const roleName = user?.roleName || role?.name || role?.roleName;
  const isAdmin = roleName === 'Admin' || roleName === 'admin' || 
                  roleName === 'Super Admin' || roleName === 'superadmin';
  
  console.log('👑 Is Admin Check:', { roleName, isAdmin });

  // If admin, grant access without checking tab permissions
  if (isAdmin) {
    console.log('✅ Admin user - access granted automatically');
    return children;
  }

  // Check tab access for non-admin users
  if (tabKey && !canAccessTab(tabKey)) {
    console.log(`❌ Access denied to ${tabKey}. User has access to:`, accessibleTabs);
    return <Navigate to="/403" replace />;
  }

  console.log(`✅ Access granted to ${tabKey || 'protected route'}`);
  return children;
}