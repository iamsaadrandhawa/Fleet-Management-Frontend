// stores/userStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Logger from '../utils/logger';
import { userAPI } from '../services/api';

const useUserStore = create(
  persist(
    (set, get) => ({
      users: [],
      selectedUser: null,
      isLoading: false,
      error: null,
      totalCount: 0,

      fetchUsers: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
          const response = await userAPI.getAll(params);
          const usersData = response.data || response || [];
          set({
            users: usersData,
            totalCount: usersData.length,
            isLoading: false
          });
          return { success: true, data: usersData };
        } catch (error) {
          console.error('Fetch users error:', error);
          set({
            error: error.message || 'Failed to fetch users',
            isLoading: false
          });
          return { success: false, error: error.message };
        }
      },

      addUser: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await userAPI.create(userData);
          const newUser = response.data;

          set(state => ({
            users: [newUser, ...state.users],
            totalCount: state.totalCount + 1,
            isLoading: false
          }));

          Logger.createUser(newUser);
          return { success: true, user: newUser };
        } catch (error) {
          set({
            error: error.message || 'Failed to add user',
            isLoading: false
          });
          return { success: false, error: error.message };
        }
      },

      updateUser: async (id, userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await userAPI.update(id, userData);
          const updatedUser = response.data;

          set(state => ({
            users: state.users.map(user =>
              (user._id === id || user.id === id) ? updatedUser : user
            ),
            isLoading: false
          }));

          Logger.updateUser(updatedUser);
          return { success: true, user: updatedUser };
        } catch (error) {
          set({
            error: error.message || 'Failed to update user',
            isLoading: false
          });
          return { success: false, error: error.message };
        }
      },

      // ✅ HARD DELETE - Permanently remove from database
      deleteUser: async (id) => {
        console.log('🔴 HARD DELETE - Permanently removing user:', id);

        if (!id) {
          console.error('No ID provided');
          return { success: false, error: 'User ID is required' };
        }

        set({ isLoading: true, error: null });
        try {
          // ✅ Call the HARD DELETE endpoint
          await userAPI.hardDelete(id);

          // ✅ Remove from local state
          set(state => ({
            users: state.users.filter(user => user._id !== id && user.id !== id),
            totalCount: state.totalCount - 1,
            isLoading: false
          }));

          console.log('✅ User permanently deleted from database');
          return { success: true };
        } catch (error) {
          console.error('Hard delete error:', error);
          set({
            error: error.message || 'Failed to delete user',
            isLoading: false
          });
          return { success: false, error: error.message };
        }
      },

     
     // stores/userStore.js

// Deactivate user (soft delete)
deactivateUser: async (id) => {
  console.log('🟡 Deactivating user:', id);
  
  if (!id) {
    return { success: false, error: 'User ID is required' };
  }
  
  set({ isLoading: true, error: null });
  try {
    // Call the soft delete endpoint
    await userAPI.delete(id);
    
    set(state => ({
      users: state.users.map(user =>
        user._id === id || user.id === id 
          ? { ...user, isActive: false, status: 'Inactive' }
          : user
      ),
      isLoading: false
    }));
    
    console.log('✅ User deactivated successfully');
    return { success: true };
  } catch (error) {
    console.error('Deactivate error:', error);
    set({ 
      error: error.message || 'Failed to deactivate user', 
      isLoading: false 
    });
    return { success: false, error: error.message };
  }
},

// Activate user
activateUser: async (id) => {
  console.log('🟢 Activating user:', id);
  
  if (!id) {
    return { success: false, error: 'User ID is required' };
  }
  
  set({ isLoading: true, error: null });
  try {
    // Call update endpoint to set isActive to true
    await userAPI.update(id, { isActive: true });
    
    set(state => ({
      users: state.users.map(user =>
        user._id === id || user.id === id 
          ? { ...user, isActive: true, status: 'Active' }
          : user
      ),
      isLoading: false
    }));
    
    console.log('✅ User activated successfully');
    return { success: true };
  } catch (error) {
    console.error('Activate error:', error);
    set({ 
      error: error.message || 'Failed to activate user', 
      isLoading: false 
    });
    return { success: false, error: error.message };
  }
},
      clearError: () => set({ error: null }),

      reset: () => set({
        users: [],
        selectedUser: null,
        isLoading: false,
        error: null,
        totalCount: 0
      })
    }),
    {
      name: 'user-storage',
      partialize: () => ({})
    }
  )
);

export default useUserStore;