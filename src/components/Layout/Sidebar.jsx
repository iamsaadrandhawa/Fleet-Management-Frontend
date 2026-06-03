// components/Layout/Sidebar.jsx
import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, UserPlus, Car, Users, Truck,
  UserCog, Settings, DatabaseSearch, Menu, X, LogOut,
} from 'lucide-react';
import useAuthStore from '../../stores/authStore';

// ✅ tabKey must match exactly your DB tabPermissions keys
const ALL_MENU_ITEMS = [
  { path: '/dashboard',    name: 'Dashboard',    icon: LayoutDashboard, tabKey: 'dashboard'    },
  { path: '/add-driver',   name: 'Add Driver',   icon: UserPlus,        tabKey: 'add-driver'   },
  { path: '/add-vehicle',  name: 'Add Vehicle',  icon: Car,             tabKey: 'add-vehicle'  },
  { path: '/driver-list',  name: 'Driver List',  icon: Users,           tabKey: 'driver-list'  },
  { path: '/vehicle-list', name: 'Vehicle List', icon: Truck,           tabKey: 'vehicle-list' },
  { path: '/users',        name: 'Users',        icon: UserCog,         tabKey: 'users'        },
  { path: '/ledgers',      name: 'Ledgers',      icon: DatabaseSearch,  tabKey: 'ledgers'      },
  { path: '/settings',     name: 'Settings',     icon: Settings,        tabKey: 'settings'     },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout, canAccessTab } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // ✅ Filter menu items — only show tabs the user has access to
  const menuItems = ALL_MENU_ITEMS.filter((item) => canAccessTab(item.tabKey));

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLinkClick = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <>
      {/* ✅ Show role badge */}
      {user?.roleName && (
        <div className="px-6 pt-4 pb-2">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
            {user.roleName}
          </span>
        </div>
      )}

      <nav className="mt-2">
        {menuItems.length === 0 ? (
          <p className="px-6 py-4 text-sm text-gray-400">No tabs available</p>
        ) : (
          menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                  }`
                }
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            );
          })
        )}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 w-full text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  if (!isMobile) {
    return (
      <>
        <aside className="w-64 bg-gray-50 min-h-screen fixed left-0 top-16 overflow-y-auto shadow-md">
          <SidebarContent />
        </aside>
        <div className="w-64 flex-shrink-0" />
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 right-4 z-50 bg-blue-600 text-white p-2 rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className={`fixed top-0 left-0 h-full w-64 bg-gray-50 shadow-xl z-40 transition-transform duration-300 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SidebarContent />
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 backdrop-blur-md z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}