// stores/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';
import useLogStore from './logStore';

let lastLoginAttempt = 0;
let isLoggingIn = false;
const LOGIN_DEDUPLICATION_WINDOW = 5000;

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      // Role-based permissions state
      role: null,
      permissions: null,
      tabPermissions: null,
      accessibleTabs: [],

      login: async (email, password, rememberMe = false) => {
        if (isLoggingIn) {
          console.log('Login already in progress, skipping...');
          return { success: false, error: 'Login already in progress' };
        }

        const now = Date.now();
        if (now - lastLoginAttempt < LOGIN_DEDUPLICATION_WINDOW) {
          console.log('Duplicate login attempt prevented');
          return { success: false, error: 'Please wait before trying again' };
        }

        isLoggingIn = true;
        lastLoginAttempt = now;

        set({ isLoading: true, error: null });

        try {
          const response = await authAPI.login({ email, password });

          console.log('Login API response:', response);

          // Store token based on rememberMe preference
          if (rememberMe) {
            localStorage.setItem('token', response.token);
          } else {
            sessionStorage.setItem('token', response.token);
          }

          // Extract role data from response - CHECK roleId FIRST (your backend sends roleId)
          let roleData = null;
          let permissions = null;
          let tabPermissions = null;
          let accessibleTabs = [];

          // ✅ IMPORTANT: Your backend sends role data in 'roleId', not 'role'
          const roleFromResponse = response.user.roleId || response.user.role;
          
          if (roleFromResponse) {
            roleData = roleFromResponse;
            permissions = roleData.permissions || null;
            tabPermissions = roleData.tabPermissions || null;
            
            console.log('✅ Role Data:', roleData);
            console.log('✅ Permissions:', permissions);
            console.log('✅ Tab Permissions:', tabPermissions);
            
            // Calculate accessible tabs
            if (tabPermissions && typeof tabPermissions === 'object') {
              Object.keys(tabPermissions).forEach(tabId => {
                if (tabPermissions[tabId] === true) {
                  accessibleTabs.push(tabId);
                }
              });
            }
          } else {
            console.warn('⚠️ No role data found in response!');
          }

          console.log('✅ Accessible Tabs calculated:', accessibleTabs);

          // Build user object
          const user = {
            id: response.user.id || response.user._id,
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            email: response.user.email,
            phone: response.user.phone || '',
            roleName: response.user.roleName || roleData?.name,
            department: response.user.department || '',
            location: response.user.location || '',
            employeeId: response.user.employeeId,
            role: roleData,
            permissions: permissions || {}
          };

          console.log('Stored user object:', user);

          localStorage.setItem('user', JSON.stringify(user));

          set({
            user,
            token: response.token,
            isAuthenticated: true,
            role: roleData,
            permissions: permissions,
            tabPermissions: tabPermissions,
            accessibleTabs: accessibleTabs,
            isLoading: false,
            error: null
          });

          setTimeout(async () => {
            await useLogStore.getState().logLogin('SUCCESS', null, email);
          }, 100);

          return { success: true, user, accessibleTabs };

        } catch (error) {
          console.error('Login error:', error);
          const errorMessage = error.message || 'Invalid email or password';

          set({ error: errorMessage, isLoading: false });

          await useLogStore.getState().logLogin('FAILED', errorMessage, email);

          return { success: false, error: errorMessage };
        } finally {
          setTimeout(() => { isLoggingIn = false; }, 1000);
        }
      },

      logout: async () => {
        const { user } = get();
        set({ isLoading: true });

        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Logout API error:', error);
        } finally {
          if (user && user.email) {
            await useLogStore.getState().logLogout(user.email);
          }

          localStorage.removeItem('token');
          localStorage.removeItem('user');
          sessionStorage.removeItem('token');

          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false, 
            role: null,
            permissions: null,
            tabPermissions: null,
            accessibleTabs: [],
            isLoading: false, 
            error: null 
          });
        }
      },

      loadUser: async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');

        if (!token) {
          set({ isLoading: false, isAuthenticated: false });
          return null;
        }

        set({ isLoading: true });

        try {
          const response = await authAPI.getProfile();

          // Extract role data from response - CHECK roleId FIRST
          let roleData = null;
          let permissions = null;
          let tabPermissions = null;
          let accessibleTabs = [];

          // ✅ IMPORTANT: Your backend sends role data in 'roleId', not 'role'
          const roleFromResponse = response.data.roleId || response.data.role;
          
          if (roleFromResponse) {
            roleData = roleFromResponse;
            permissions = roleData.permissions || null;
            tabPermissions = roleData.tabPermissions || null;
            
            if (tabPermissions && typeof tabPermissions === 'object') {
              Object.keys(tabPermissions).forEach(tabId => {
                if (tabPermissions[tabId] === true) {
                  accessibleTabs.push(tabId);
                }
              });
            }
          }

          // Build user object
          const user = {
            id: response.data.id || response.data._id,
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            email: response.data.email,
            phone: response.data.phone || '',
            roleName: response.data.roleName || roleData?.name,
            department: response.data.department || '',
            location: response.data.location || '',
            employeeId: response.data.employeeId,
            role: roleData,
            permissions: permissions || {}
          };

          localStorage.setItem('user', JSON.stringify(user));

          set({ 
            user, 
            isAuthenticated: true, 
            role: roleData,
            permissions: permissions,
            tabPermissions: tabPermissions,
            accessibleTabs: accessibleTabs,
            isLoading: false, 
            error: null 
          });

          console.log('Loaded accessibleTabs:', accessibleTabs);

          return user;
        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          sessionStorage.removeItem('token');
          set({ 
            user: null, 
            isAuthenticated: false, 
            role: null,
            permissions: null,
            tabPermissions: null,
            accessibleTabs: [],
            isLoading: false, 
            error: null 
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),

      updateUser: (userData) => {
        const updatedUser = { ...get().user, ...userData };
        set({ user: updatedUser });
        localStorage.setItem('user', JSON.stringify(updatedUser));
      },

      // Check CRUD permission — Admin/Super Admin always pass
      hasPermission: (action) => {
        const { user, permissions } = get();
        if (!user) return false;
        
        // Check role name from multiple possible sources
        const roleName = user.roleName || user.role?.name || user.role?.roleName;
        if (roleName === 'Admin' || roleName === 'admin' || roleName === 'Super Admin') {
          return true;
        }
        
        return permissions?.[action] === true;
      },

      // Check tab access — Admin/Super Admin always pass
      canAccessTab: (tabKey) => {
        const { user, accessibleTabs } = get();
        if (!user) return false;
        
        // Check role name from multiple possible sources
        const roleName = user.roleName || user.role?.name || user.role?.roleName;
        if (roleName === 'Admin' || roleName === 'admin' || roleName === 'Super Admin') {
          return true;
        }
        
        return accessibleTabs.includes(tabKey);
      },

      // ✅ NEW: Check if user can view ledger data (makes, fuel types, etc.)
      // This is separate from tab permission
      canViewLedgerData: () => {
        const { user, permissions } = get();
        if (!user) return false;
        
        // Admin always has access
        const roleName = user.roleName || user.role?.name || user.role?.roleName;
        if (roleName === 'Admin' || roleName === 'admin' || roleName === 'Super Admin') {
          return true;
        }
        
        // Check if user has permission to view ledger data
        // You can add a specific permission or allow all users
        // Option 1: Allow all authenticated users to view ledger data
        return true;
        
        // Option 2: Use a specific permission (uncomment if you want to control it)
        // return permissions?.viewLedgerData === true;
      },

      // Alias for hasPermission (for consistency)
      canPerform: (action) => {
        return get().hasPermission(action);
      },

      // Get all accessible tabs
      getAccessibleTabs: () => {
        const { accessibleTabs, user } = get();
        
        const roleName = user?.roleName || user?.role?.name || user?.role?.roleName;
        if (roleName === 'Admin' || roleName === 'admin' || roleName === 'Super Admin') {
          return ['dashboard', 'add-driver', 'add-vehicle', 'driver-list', 'vehicle-list', 'users', 'ledgers', 'settings'];
        }
        
        return accessibleTabs;
      },

      hasRole: (role) => {
        const { user } = get();
        if (!user) return false;
        
        const userRole = user.roleName || user.role?.name || user.role?.roleName;
        if (Array.isArray(role)) {
          return role.includes(userRole);
        }
        return userRole === role;
      },

      getFullName: () => {
        const { user } = get();
        if (!user) return '';
        return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
      },

      // Refresh permissions (call after role updates)
      refreshPermissions: async () => {
        const { user } = get();
        if (!user) return { success: false, error: 'No user logged in' };
        
        try {
          const response = await authAPI.getProfile();
          
          let roleData = null;
          let permissions = null;
          let tabPermissions = null;
          let accessibleTabs = [];

          // ✅ IMPORTANT: Your backend sends role data in 'roleId', not 'role'
          const roleFromResponse = response.data.roleId || response.data.role;
          
          if (roleFromResponse) {
            roleData = roleFromResponse;
            permissions = roleData.permissions || null;
            tabPermissions = roleData.tabPermissions || null;
            
            if (tabPermissions && typeof tabPermissions === 'object') {
              Object.keys(tabPermissions).forEach(tabId => {
                if (tabPermissions[tabId] === true) {
                  accessibleTabs.push(tabId);
                }
              });
            }
          }
          
          set({
            role: roleData,
            permissions: permissions,
            tabPermissions: tabPermissions,
            accessibleTabs: accessibleTabs
          });
          
          // Update user object
          const updatedUser = { ...user, permissions: permissions || {}, role: roleData };
          set({ user: updatedUser });
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          console.log('✅ Permissions refreshed. Accessible tabs:', accessibleTabs);
          return { success: true, accessibleTabs };
        } catch (error) {
          console.error('Failed to refresh permissions:', error);
          return { success: false, error: error.message };
        }
      }
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        role: state.role,
        permissions: state.permissions,
        tabPermissions: state.tabPermissions,
        accessibleTabs: state.accessibleTabs
      })
    }
  )
);

export default useAuthStore;