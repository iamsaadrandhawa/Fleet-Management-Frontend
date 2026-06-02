// stores/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';
import useLogStore from './logStore';

// Track login attempts to prevent duplicates
let lastLoginAttempt = 0;
const LOGIN_DEDUPLICATION_WINDOW = 10000; // 10 seconds

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login with real API
      login: async (email, password, rememberMe = false) => {
        // Prevent duplicate login attempts
        const now = Date.now();
        if (now - lastLoginAttempt < LOGIN_DEDUPLICATION_WINDOW) {
          console.log('Duplicate login attempt prevented');
          return { success: false, error: 'Please wait before trying again' };
        }
        lastLoginAttempt = now;
        
        set({ isLoading: true, error: null });
        
        try {
          // Call actual API
          const response = await authAPI.login({ email, password });
          
          console.log('Login API response:', response);
          
          // Store token based on rememberMe preference
          if (rememberMe) {
            localStorage.setItem('token', response.token);
          } else {
            sessionStorage.setItem('token', response.token);
          }
          
          // Transform user data to match your actual API response
          const user = {
            id: response.user.id || response.user._id,
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            email: response.user.email,
            phone: response.user.phone || '',
            role: response.user.roleName,
            roleName: response.user.roleName,
            department: response.user.department || '',
            location: response.user.location || '',
            employeeId: response.user.employeeId,
            permissions: response.user.permissions || {}
          };
          
          console.log('Stored user object:', user);
          
          set({
            user: user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          
          // Create login log using log store (only once)
          await useLogStore.getState().logLogin('SUCCESS', null, email);
          
          return { success: true, user };
          
        } catch (error) {
          console.error('Login error:', error);
          const errorMessage = error.message || 'Invalid email or password';
          
          set({
            error: errorMessage,
            isLoading: false
          });
          
          // Create failed login log
          await useLogStore.getState().logLogin('FAILED', errorMessage, email);
          
          return { success: false, error: errorMessage };
        }
      },

      // Logout with real API
      logout: async () => {
        const { user } = get();
        set({ isLoading: true });
        
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Logout API error:', error);
        } finally {
          // Create logout log
          if (user && user.email) {
            await useLogStore.getState().logLogout(user.email);
          }
          
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      },

      // Load user profile from API
      loadUser: async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (!token) {
          set({ isLoading: false, isAuthenticated: false });
          return null;
        }
        
        set({ isLoading: true });
        
        try {
          const response = await authAPI.getProfile();
          
          const user = {
            id: response.data.id || response.data._id,
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            email: response.data.email,
            phone: response.data.phone || '',
            role: response.data.roleName,
            roleName: response.data.roleName,
            department: response.data.department || '',
            location: response.data.location || '',
            employeeId: response.data.employeeId,
            permissions: response.data.permissions || {}
          };
          
          set({
            user: user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          
          return user;
        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
      
      updateUser: (userData) => set({ user: { ...get().user, ...userData } }),
      
      // Check if user has specific permission
      hasPermission: (action) => {
        const { user } = get();
        if (!user) return false;
        // Admin and Super Admin have all permissions
        if (user.role === 'Admin' || user.role === 'Super Admin') return true;
        return user.permissions?.[action] === true;
      },
      
      // Check if user has specific role
      hasRole: (role) => {
        const { user } = get();
        if (!user) return false;
        if (Array.isArray(role)) {
          return role.includes(user.role);
        }
        return user.role === role;
      },
      
      // Get user full name
      getFullName: () => {
        const { user } = get();
        if (!user) return '';
        return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
      }
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export default useAuthStore;