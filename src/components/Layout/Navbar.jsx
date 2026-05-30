import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import logo from '../../assets/logo.png';

export default function Navbar() {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30 h-16 w-full">
      <div className="px-4 sm:px-6 lg:px-8 h-full w-full">
        <div className="flex justify-between items-center h-full">
          <div className="flex items-center gap-2">
            <img className="h-8 w-8 object-contain" src={logo} alt="Logo" />
            <span className="text-sm md:text-base font-semibold text-gray-900">
              JadeedFleet Pro
            </span>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <span className="hidden md:block text-sm text-gray-600">
                Welcome, {user.firstName}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}