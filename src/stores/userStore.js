// stores/userStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// import Logger from '../utils/logger'; // COMMENT OUT OR REMOVE THIS LINE
import { userAPI } from '../services/api';
import useLogStore from './logStore';

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
          
          // Log error only
          await useLogStore.getState().addLog({
            action: 'READ',
            module: 'USER',
            status: 'ERROR',
            errorMessage: error.message,
            description: `Failed to fetch users: ${error.message}`
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

          // ONLY use logStore - remove Logger.createUser
          await useLogStore.getState().logCreate(
            'USER',
            newUser._id || newUser.id,
            newUser.name || newUser.email,
            {
              email: newUser.email,
              role: newUser.role,
              isActive: newUser.isActive,
              ...userData
            }
          );
          
          return { success: true, user: newUser };
        } catch (error) {
          console.error('Add user error:', error);
          set({
            error: error.message || 'Failed to add user',
            isLoading: false
          });
          
          await useLogStore.getState().addLog({
            action: 'CREATE',
            module: 'USER',
            status: 'ERROR',
            errorMessage: error.message,
            metadata: { userData: { ...userData, password: undefined } },
            description: `Failed to create user: ${userData.name || userData.email} - ${error.message}`
          });
          
          return { success: false, error: error.message };
        }
      },

      updateUser: async (id, userData) => {
        set({ isLoading: true, error: null });
        try {
          const oldUser = get().users.find(u => (u._id === id || u.id === id));
          
          const response = await userAPI.update(id, userData);
          const updatedUser = response.data;

          set(state => ({
            users: state.users.map(user =>
              (user._id === id || user.id === id) ? updatedUser : user
            ),
            isLoading: false
          }));

          // Calculate changes
          const changes = {};
          if (oldUser) {
            if (oldUser.name !== updatedUser.name) changes.name = { old: oldUser.name, new: updatedUser.name };
            if (oldUser.email !== updatedUser.email) changes.email = { old: oldUser.email, new: updatedUser.email };
            if (oldUser.role !== updatedUser.role) changes.role = { old: oldUser.role, new: updatedUser.role };
            if (oldUser.isActive !== updatedUser.isActive) changes.isActive = { old: oldUser.isActive, new: updatedUser.isActive };
          }

          // ONLY use logStore - remove Logger.updateUser
          await useLogStore.getState().logUpdate(
            'USER',
            id,
            updatedUser.name || updatedUser.email,
            changes,
            {
              email: updatedUser.email,
              role: updatedUser.role,
              updatedFields: Object.keys(userData)
            }
          );
          
          return { success: true, user: updatedUser };
        } catch (error) {
          console.error('Update user error:', error);
          set({
            error: error.message || 'Failed to update user',
            isLoading: false
          });
          
          await useLogStore.getState().addLog({
            action: 'UPDATE',
            module: 'USER',
            targetId: id,
            status: 'ERROR',
            errorMessage: error.message,
            description: `Failed to update user ID: ${id} - ${error.message}`
          });
          
          return { success: false, error: error.message };
        }
      },

      deleteUser: async (id) => {
        console.log('🔴 HARD DELETE - Permanently removing user:', id);

        if (!id) {
          console.error('No ID provided');
          return { success: false, error: 'User ID is required' };
        }

        set({ isLoading: true, error: null });
        try {
          const userToDelete = get().users.find(u => (u._id === id || u.id === id));
          
          await userAPI.hardDelete(id);

          set(state => ({
            users: state.users.filter(user => user._id !== id && user.id !== id),
            totalCount: state.totalCount - 1,
            isLoading: false
          }));

          // ONLY use logStore - remove Logger.deleteUser
          await useLogStore.getState().logDelete(
            'USER',
            id,
            userToDelete?.name || userToDelete?.email || 'Unknown User',
            {
              hardDelete: true,
              email: userToDelete?.email,
              role: userToDelete?.role,
              deletedAt: new Date().toISOString()
            }
          );
          
          console.log('✅ User permanently deleted from database');
          return { success: true };
        } catch (error) {
          console.error('Hard delete error:', error);
          set({
            error: error.message || 'Failed to delete user',
            isLoading: false
          });
          
          await useLogStore.getState().addLog({
            action: 'DELETE',
            module: 'USER',
            targetId: id,
            status: 'ERROR',
            errorMessage: error.message,
            metadata: { hardDelete: true },
            description: `Failed to permanently delete user ID: ${id} - ${error.message}`
          });
          
          return { success: false, error: error.message };
        }
      },

      deactivateUser: async (id) => {
        console.log('🟡 Deactivating user:', id);

        if (!id) {
          return { success: false, error: 'User ID is required' };
        }

        set({ isLoading: true, error: null });
        try {
          const userToDeactivate = get().users.find(u => (u._id === id || u.id === id));
          
          await userAPI.delete(id);

          set(state => ({
            users: state.users.map(user =>
              user._id === id || user.id === id
                ? { ...user, isActive: false, status: 'Inactive' }
                : user
            ),
            isLoading: false
          }));

          await useLogStore.getState().addLog({
            action: 'DEACTIVATE',
            module: 'USER',
            targetId: id,
            targetName: userToDeactivate?.name || userToDeactivate?.email || 'Unknown User',
            changes: { isActive: { old: true, new: false }, status: { old: 'Active', new: 'Inactive' } },
            metadata: {
              email: userToDeactivate?.email,
              role: userToDeactivate?.role,
              deactivatedAt: new Date().toISOString()
            },
            description: `Deactivated user: ${userToDeactivate?.name || userToDeactivate?.email}`
          });
          
          console.log('✅ User deactivated successfully');
          return { success: true };
        } catch (error) {
          console.error('Deactivate error:', error);
          set({
            error: error.message || 'Failed to deactivate user',
            isLoading: false
          });
          
          await useLogStore.getState().addLog({
            action: 'DEACTIVATE',
            module: 'USER',
            targetId: id,
            status: 'ERROR',
            errorMessage: error.message,
            description: `Failed to deactivate user ID: ${id} - ${error.message}`
          });
          
          return { success: false, error: error.message };
        }
      },

      activateUser: async (id) => {
        console.log('🟢 Activating user:', id);

        if (!id) {
          return { success: false, error: 'User ID is required' };
        }

        set({ isLoading: true, error: null });
        try {
          const userToActivate = get().users.find(u => (u._id === id || u.id === id));
          
          await userAPI.update(id, { isActive: true });

          set(state => ({
            users: state.users.map(user =>
              user._id === id || user.id === id
                ? { ...user, isActive: true, status: 'Active' }
                : user
            ),
            isLoading: false
          }));

          await useLogStore.getState().addLog({
            action: 'ACTIVATE',
            module: 'USER',
            targetId: id,
            targetName: userToActivate?.name || userToActivate?.email || 'Unknown User',
            changes: { isActive: { old: false, new: true }, status: { old: 'Inactive', new: 'Active' } },
            metadata: {
              email: userToActivate?.email,
              role: userToActivate?.role,
              activatedAt: new Date().toISOString()
            },
            description: `Activated user: ${userToActivate?.name || userToActivate?.email}`
          });
          
          console.log('✅ User activated successfully');
          return { success: true };
        } catch (error) {
          console.error('Activate error:', error);
          set({
            error: error.message || 'Failed to activate user',
            isLoading: false
          });
          
          await useLogStore.getState().addLog({
            action: 'ACTIVATE',
            module: 'USER',
            targetId: id,
            status: 'ERROR',
            errorMessage: error.message,
            description: `Failed to activate user ID: ${id} - ${error.message}`
          });
          
          return { success: false, error: error.message };
        }
      },

      bulkUpdateStatus: async (userIds, status) => {
        set({ isLoading: true, error: null });
        try {
          const response = await userAPI.bulkUpdateStatus({ userIds, status });
          
          set(state => ({
            users: state.users.map(user =>
              userIds.includes(user._id) || userIds.includes(user.id)
                ? { ...user, isActive: status === 'active', status: status }
                : user
            ),
            isLoading: false
          }));

          await useLogStore.getState().addLog({
            action: 'BULK_UPDATE',
            module: 'USER',
            metadata: {
              userIds,
              status,
              count: userIds.length
            },
            description: `Bulk ${status} action applied to ${userIds.length} users`
          });
          
          return { success: true, data: response.data };
        } catch (error) {
          console.error('Bulk update error:', error);
          set({
            error: error.message || 'Failed to bulk update users',
            isLoading: false
          });
          
          await useLogStore.getState().addLog({
            action: 'BULK_UPDATE',
            module: 'USER',
            status: 'ERROR',
            errorMessage: error.message,
            metadata: { userIds, status, count: userIds.length },
            description: `Failed to bulk ${status} users: ${error.message}`
          });
          
          return { success: false, error: error.message };
        }
      },

      getUserById: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await userAPI.getById(id);
          const userData = response.data;
          
          set({
            selectedUser: userData,
            isLoading: false
          });
          
          await useLogStore.getState().logView('USER', id, userData.name || userData.email);
          
          return { success: true, user: userData };
        } catch (error) {
          console.error('Get user error:', error);
          set({
            error: error.message || 'Failed to get user',
            isLoading: false
          });
          return { success: false, error: error.message };
        }
      },

      resetUserPassword: async (id, newPassword) => {
        set({ isLoading: true, error: null });
        try {
          const userToReset = get().users.find(u => (u._id === id || u.id === id));
          
          const response = await userAPI.resetPassword(id, { password: newPassword });
          
          set({ isLoading: false });
          
          await useLogStore.getState().addLog({
            action: 'RESET_PASSWORD',
            module: 'USER',
            targetId: id,
            targetName: userToReset?.name || userToReset?.email,
            description: `Reset password for user: ${userToReset?.name || userToReset?.email}`
          });
          
          return { success: true, data: response.data };
        } catch (error) {
          console.error('Reset password error:', error);
          set({
            error: error.message || 'Failed to reset password',
            isLoading: false
          });
          
          await useLogStore.getState().addLog({
            action: 'RESET_PASSWORD',
            module: 'USER',
            targetId: id,
            status: 'ERROR',
            errorMessage: error.message,
            description: `Failed to reset password for user ID: ${id}`
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