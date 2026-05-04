import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Logger from '../utils/logger';

const useUserStore = create(
  persist(
    (set, get) => ({
      users: [
        {
          id: 1,
          userId: 'USR-001',
          name: 'Super Admin',
          email: 'superadmin@fleet.com',
          phone: '+92 300 1111111',
          role: 'Super Admin',
          status: 'Active',
          department: 'Management',
          location: 'Head Office',
          joiningDate: '2023-01-01',
          lastLogin: 'Never',
        },
        {
          id: 2,
          userId: 'USR-002',
          name: 'Admin User',
          email: 'admin@fleet.com',
          phone: '+92 300 2222222',
          role: 'Admin',
          status: 'Active',
          department: 'Management',
          location: 'Head Office',
          joiningDate: '2023-03-15',
          lastLogin: 'Never',
        },
        {
          id: 3,
          userId: 'USR-003',
          name: 'Regular User',
          email: 'user@fleet.com',
          phone: '+92 300 3333333',
          role: 'Staff',
          status: 'Active',
          department: 'Operations',
          location: 'Karachi',
          joiningDate: '2023-06-01',
          lastLogin: 'Never',
        },
        {
          id: 4,
          userId: 'USR-004',
          name: 'Viewer User',
          email: 'viewer@fleet.com',
          phone: '+92 300 4444444',
          role: 'Viewer',
          status: 'Active',
          department: 'Operations',
          location: 'Karachi',
          joiningDate: '2023-06-01',
          lastLogin: 'Never',
        },
      ],
      isLoading: false,
      error: null,

      fetchUsers: () => {
        return get().users;
      },

      addUser: async (userData) => {
        set({ isLoading: true });
        try {
          const newUser = {
            id: Date.now(),
            userId: `USR-${String(get().users.length + 1).padStart(3, '0')}`,
            ...userData,
            joiningDate: new Date().toISOString().split('T')[0],
            lastLogin: 'Never',
            createdAt: new Date().toISOString(),
          };
          set(state => ({
            users: [...state.users, newUser],
            isLoading: false
          }));
          
          // ✅ Log the activity
          Logger.createUser(newUser);
          
          return { success: true, user: newUser };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      updateUser: async (id, userData) => {
        set({ isLoading: true });
        try {
          // Get the user before update for logging
          const oldUser = get().users.find(user => user.id === id);
          
          set(state => ({
            users: state.users.map(user =>
              user.id === id ? { ...user, ...userData, updatedAt: new Date().toISOString() } : user
            ),
            isLoading: false
          }));
          
          // ✅ Log the activity
          const updatedUser = { ...oldUser, ...userData, id };
          Logger.updateUser(updatedUser);
          
          return { success: true };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false };
        }
      },

      deleteUser: async (id) => {
        set({ isLoading: true });
        try {
          // Get user details before deletion for logging
          const userToDelete = get().users.find(user => user.id === id);
          
          set(state => ({
            users: state.users.filter(user => user.id !== id),
            isLoading: false
          }));
          
          // ✅ Log the activity
          if (userToDelete) {
            Logger.deleteUser(id, userToDelete.name);
          }
          
          return { success: true };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false };
        }
      },
    }),
    {
      name: 'user-storage',
    }
  )
);

export default useUserStore;