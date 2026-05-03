import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="add-driver" element={<AddDriver />} />
          <Route path="add-vehicle" element={<AddVehicle />} />
          <Route path="driver-list" element={<DriverList />} />
          <Route path="vehicle-list" element={<VehicleList />} />
          <Route path="users" element={<Users />} />
          <Route path="ledgers" element={<Ledgers />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;