// stores/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';
import Logger from '../utils/logger';

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
        set({ isLoading: true, error: null });
        
        try {
          // Call actual API
          const response = await authAPI.login({ email, password });
          
          console.log('Login API response:', response); // Debug log
          
          // Store token based on rememberMe preference
          if (rememberMe) {
            localStorage.setItem('token', response.token);
          } else {
            sessionStorage.setItem('token', response.token);
          }
          
          // ✅ Transform user data to match your actual API response
          const user = {
            id: response.user.id || response.user._id,
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            email: response.user.email,
            phone: response.user.phone || '',
            role: response.user.roleName,  // ✅ Use roleName from API
            roleName: response.user.roleName,
            department: response.user.department || '',
            location: response.user.location || '',
            employeeId: response.user.employeeId,
            permissions: response.user.permissions || {}  // ✅ Store permissions object
          };
          
          console.log('Stored user object:', user); // Debug log
          
          set({
            user: user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          
          Logger.login(user);
          return { success: true, user };
          
        } catch (error) {
          console.error('Login error:', error);
          set({
            error: error.message || 'Invalid email or password',
            isLoading: false
          });
          return { success: false, error: error.message };
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
      
      // Check if user has specific permission (using actual permissions object)
      hasPermission: (action) => {
        const { user } = get();
        if (!user) return false;
        // Check from permissions object returned from API
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