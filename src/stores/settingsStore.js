import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';
import Logger from '../utils/logger';

const useSettingsStore = create(
  persist(
    (set, get) => ({
      isLoading: false,
      error: null,

      changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true, error: null });
        
        try {
          // Call API to change password
          const response = await authAPI.changePassword({ currentPassword, newPassword });
          
          set({ isLoading: false });
          
          // Log the activity
          const { user } = useAuthStore.getState();
          Logger.log('UPDATE', 'AUTH', user?.id, { 
            action: 'PASSWORD_CHANGED', 
            email: user?.email,
            name: user?.name
          });
          
          return { success: true };
        } catch (error) {
          set({ 
            error: error.message || 'Failed to change password', 
            isLoading: false 
          });
          return { success: false, error: error.message };
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'settings-storage',
    }
  )
);

export default useSettingsStore;