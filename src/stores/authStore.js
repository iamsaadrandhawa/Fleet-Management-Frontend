import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email, password, rememberMe = false) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call - replace with actual API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock user data
          const userData = {
            id: 1,
            name: 'Admin User',
            email: email,
            role: 'super_admin',
            permissions: ['create', 'read', 'update', 'delete', 'manage_users']
          };
          
          const token = 'mock-jwt-token-' + Date.now();
          
          set({
            user: userData,
            token: token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          
          if (rememberMe) {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
          } else {
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', JSON.stringify(userData));
          }
          
          return { success: true };
        } catch (error) {
          set({
            error: error.message || 'Login failed',
            isLoading: false
          });
          return { success: false, error: error.message };
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
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