// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import AddDriver from './pages/Drivers/AddDriver';
import AddVehicle from './pages/Vehicles/AddVehicle';
import DriverList from './pages/Drivers/DriverList';
import VehicleList from './pages/Vehicles/VehicleList';
import Users from './pages/Users/Users';
import Ledgers from './pages/Ledgers/Ledgers';
import Settings from './pages/Settings/Settings';
import ActivityLogs from './utils/ActivityLogs';
import useAuthStore from './stores/authStore';

// ✅ Simple 403 page
function Forbidden() {
  const { accessibleTabs, user } = useAuthStore();
  
  // Get the first accessible tab for the user
  const getFirstAccessiblePath = () => {
    if (accessibleTabs.includes('add-driver')) return '/add-driver';
    if (accessibleTabs.includes('add-vehicle')) return '/add-vehicle';
    if (accessibleTabs.includes('driver-list')) return '/driver-list';
    if (accessibleTabs.includes('vehicle-list')) return '/vehicle-list';
    if (accessibleTabs.includes('dashboard')) return '/dashboard';
    return '/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-500">403</h1>
        <p className="mt-2 text-lg text-gray-600">You don't have permission to access this page.</p>
        <p className="text-sm text-gray-500 mt-1">Your role: {user?.roleName || 'Unknown'}</p>
        <a 
          href={getFirstAccessiblePath()} 
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          Go to Available Page
        </a>
      </div>
    </div>
  );
}

function App() {
  const { loadUser, isAuthenticated, accessibleTabs, user } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token && !isAuthenticated) {
      loadUser();
    }
  }, [isAuthenticated, loadUser]);

  // ✅ Smart redirect based on user's permissions
  const getDefaultRedirect = () => {
    if (!isAuthenticated) return '/login';
    
    // Admin can go to dashboard
    if (user?.roleName === 'Admin' || user?.roleName === 'Super Admin') {
      return '/dashboard';
    }
    
    // For non-admin users, redirect to their first accessible tab
    if (accessibleTabs.includes('add-driver')) return '/add-driver';
    if (accessibleTabs.includes('add-vehicle')) return '/add-vehicle';
    if (accessibleTabs.includes('driver-list')) return '/driver-list';
    if (accessibleTabs.includes('vehicle-list')) return '/vehicle-list';
    if (accessibleTabs.includes('dashboard')) return '/dashboard';
    
    // Fallback to 403 if no accessible tabs
    return '/403';
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/403" element={<Forbidden />} />

        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to={getDefaultRedirect()} replace />} />

          <Route 
            path="dashboard" 
            element={
              <ProtectedRoute tabKey="dashboard">
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="add-driver" element={
            <ProtectedRoute tabKey="add-driver"><AddDriver /></ProtectedRoute>
          } />
          <Route path="add-vehicle" element={
            <ProtectedRoute tabKey="add-vehicle"><AddVehicle /></ProtectedRoute>
          } />
          <Route path="driver-list" element={
            <ProtectedRoute tabKey="driver-list"><DriverList /></ProtectedRoute>
          } />
          <Route path="vehicle-list" element={
            <ProtectedRoute tabKey="vehicle-list"><VehicleList /></ProtectedRoute>
          } />
          <Route path="users" element={
            <ProtectedRoute tabKey="users"><Users /></ProtectedRoute>
          } />
          <Route path="ledgers" element={
            <ProtectedRoute tabKey="ledgers"><Ledgers /></ProtectedRoute>
          } />
          <Route path="settings" element={
            <ProtectedRoute tabKey="settings"><Settings /></ProtectedRoute>
          } />
          <Route path="activity-logs" element={
            <ProtectedRoute tabKey="ledgers"><ActivityLogs /></ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;