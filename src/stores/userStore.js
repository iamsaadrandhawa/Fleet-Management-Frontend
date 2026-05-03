import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserStore = create(
  persist(
    (set, get) => ({
      // State
      users: [
        {
          id: 1,
          userId: 'USR-001',
          name: 'Super Admin',
          email: 'superadmin@fleet.com',
          phone: '+92 300 1111111',
          role: 'super_admin',
          status: 'Active',
          department: 'Management',
          location: 'Head Office',
        },
        {
          id: 2,
          userId: 'USR-002',
          name: 'Admin User',
          email: 'admin@fleet.com',
          phone: '+92 300 2222222',
          role: 'admin',
          status: 'Active',
          department: 'Management',
          location: 'Head Office',
        },
      ],
      isLoading: false,
      error: null,

      // Actions
      fetchUsers: async () => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 500));
        set({ isLoading: false });
      },

      addUser: async (userData) => {
        set({ isLoading: true });
        try {
          const newUser = {
            id: Date.now(),
            userId: `USR-${String(get().users.length + 1).padStart(3, '0')}`,
            ...userData,
            status: 'Active',
            createdAt: new Date().toISOString(),
          };
          set(state => ({
            users: [newUser, ...state.users],
            isLoading: false
          }));
          return { success: true, user: newUser };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false };
        }
      },

      updateUser: async (id, userData) => {
        set({ isLoading: true });
        try {
          set(state => ({
            users: state.users.map(user =>
              user.id === id ? { ...user, ...userData } : user
            ),
            isLoading: false
          }));
          return { success: true };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false };
        }
      },

      deleteUser: async (id) => {
        set({ isLoading: true });
        try {
          set(state => ({
            users: state.users.filter(user => user.id !== id),
            isLoading: false
          }));
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