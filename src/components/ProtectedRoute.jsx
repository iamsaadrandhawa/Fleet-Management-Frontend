// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

export default function ProtectedRoute({ children, tabKey }) {
  const { isAuthenticated, isLoading, canAccessTab, accessibleTabs, user } = useAuthStore();

  // Debug logging
  console.log('🔒 ProtectedRoute Debug:');
  console.log('  tabKey:', tabKey);
  console.log('  isAuthenticated:', isAuthenticated);
  console.log('  isLoading:', isLoading);
  console.log('  accessibleTabs:', accessibleTabs);
  console.log('  user:', user);
  console.log('  user.roleName:', user?.roleName);
  console.log('  canAccessTab result:', canAccessTab(tabKey));

  if (isLoading) {
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

  if (tabKey && !canAccessTab(tabKey)) {
    console.log(`❌ Access denied to ${tabKey}. User has access to:`, accessibleTabs);
    return <Navigate to="/403" replace />;
  }

  console.log(`✅ Access granted to ${tabKey}`);
  return children;
}