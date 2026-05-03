import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// import { authAPI } from '../services/api'; // Commented for now
import Logger from '../utils/logger';

// Mock users for testing
const MOCK_USERS = [
  {
    id: 1,
    name: 'Super Admin',
    email: 'super@fleet.com',
    phone: '+92 300 1111111',
    role: 'Super Admin',
    department: 'Management',
    location: 'Head Office',
    permissions: ['create', 'read', 'update', 'delete', 'manage_users'],
  },
  {
    id: 2,
    name: 'Admin User',
    email: 'admin@fleet.com',
    phone: '+92 300 2222222',
    role: 'Admin',
    department: 'Management',
    location: 'Head Office',
    permissions: ['create', 'read', 'update', 'delete'],
  },
  {
    id: 3,
    name: 'Viewer User',
    email: 'view@fleet.com',
    phone: '+92 300 3333333',
    role: 'Viewer',
    department: 'Audit',
    location: 'Head Office',
    permissions: ['read'],
  },
];

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password, rememberMe = false) => {
        set({ isLoading: true, error: null });
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock login validation
        const mockUser = MOCK_USERS.find(user => user.email === email);
        
        // Check credentials
        if (mockUser) {
          // Validate password based on email
          let isValid = false;
          if (email === 'super@fleet.com' && password === 'super123') isValid = true;
          else if (email === 'admin@fleet.com' && password === 'admin123') isValid = true;
          else if (email === 'view@fleet.com' && password === 'view123') isValid = true;
          
          if (isValid) {
            const token = 'mock-jwt-token-' + Date.now();
            
            if (rememberMe) {
              localStorage.setItem('token', token);
            } else {
              sessionStorage.setItem('token', token);
            }
            
            set({
              user: mockUser,
              token: token,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            
            Logger.login(mockUser);
            return { success: true };
          }
        }
        
        // Login failed
        set({
          error: 'Invalid email or password',
          isLoading: false
        });
        return { success: false, error: 'Invalid email or password' };
      },

      logout: async () => {
        const { user } = get();
        set({ isLoading: true });
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (user) Logger.logout(user);
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      },

      changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true, error: null });
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock validation
        const { user } = get();
        
        // For mock purposes, accept any current password for demo users
        if (user && newPassword.length >= 6) {
          set({ isLoading: false });
          return { success: true };
        }
        
        set({ 
          error: 'Password must be at least 6 characters', 
          isLoading: false 
        });
        return { success: false, error: 'Password must be at least 6 characters' };
      },

      getProfile: async () => {
        set({ isLoading: true });
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { user } = get();
        set({ isLoading: false });
        return user;
      },

      clearError: () => set({ error: null }),
      
      updateUser: (userData) => set({ user: { ...get().user, ...userData } }),
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
    }
  )
);

export default useAuthStore;