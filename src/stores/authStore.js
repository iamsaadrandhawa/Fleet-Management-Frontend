// stores/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';
import useLogStore from './logStore';
import { supabase } from '../services/supabaseClient';

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

          console.log('🔐 Login Response:', JSON.stringify(response, null, 2));

          const { session, user: supabaseUser, profile } = response;

          let roleData = null;
          let permissions = null;
          let tabPermissions = null;
          let accessibleTabs = [];

          if (profile) {
            // ✅ Profile has: id, email, full_name, role_id, status, created_at, updated_at
            roleData = profile.role || null;
            
            console.log('✅ Role Data from profile:', JSON.stringify(roleData, null, 2));
            
            if (roleData) {
              permissions = roleData.permissions || null;
              tabPermissions = roleData.tab_permissions || null;
              
              console.log('✅ Permissions:', permissions);
              console.log('✅ Tab Permissions:', tabPermissions);
            }
          }

          // ✅ Calculate accessible tabs from tab_permissions
          if (tabPermissions && typeof tabPermissions === 'object') {
            console.log('📋 Processing tab_permissions:', tabPermissions);
            Object.keys(tabPermissions).forEach(tabKey => {
              if (tabPermissions[tabKey] === true) {
                accessibleTabs.push(tabKey);
              }
            });
          }

          // ✅ Check if user is Super Admin
          const isSuperAdmin = roleData?.is_super_admin === true;
          const roleName = roleData?.name || 'user';
          
          console.log('👑 Role Check:', { roleName, isSuperAdmin });
          
          // ✅ If Super Admin, grant access to ALL tabs from tab_permissions
          if (isSuperAdmin || roleName === 'Super Admin' || roleName === 'Admin') {
            console.log('👑 Super Admin detected - granting all tab access');
            
            // Get all tabs from tab_permissions
            if (tabPermissions && typeof tabPermissions === 'object') {
              accessibleTabs = Object.keys(tabPermissions);
              console.log('📋 All tabs from tab_permissions:', accessibleTabs);
            } else {
              // Fallback default tabs
              accessibleTabs = [
                'dashboard', 'add-driver', 'add-vehicle', 
                'driver-list', 'vehicle-list', 'users', 
                'ledgers', 'settings', 'admin'
              ];
            }
          }

          console.log('✅ Final Accessible Tabs:', accessibleTabs);

          // ✅ Build user object with ALL fields
          const user = {
            id: supabaseUser?.id || profile?.id,
            email: supabaseUser?.email || profile?.email || '',
            fullName: profile?.full_name || supabaseUser?.user_metadata?.full_name || '',
            firstName: profile?.full_name?.split(' ')[0] || '',
            lastName: profile?.full_name?.split(' ').slice(1).join(' ') || '',
            roleName: roleName,
            roleId: profile?.role_id || roleData?.id,
            status: profile?.status || 'active',
            role: roleData,
            permissions: permissions || {},
            tabPermissions: tabPermissions || {},
            isSuperAdmin: isSuperAdmin,
            profile: profile,
            user_metadata: supabaseUser?.user_metadata || {}
          };

          console.log('👤 Stored user object:', user);

          if (session) {
            localStorage.setItem('supabaseSession', JSON.stringify(session));
          }
          localStorage.setItem('user', JSON.stringify(user));

          set({
            user,
            token: session?.access_token || null,
            isAuthenticated: true,
            role: roleData,
            permissions: permissions || {},
            tabPermissions: tabPermissions || {},
            accessibleTabs: accessibleTabs,
            isLoading: false,
            error: null
          });

          // ✅ Log the final state
          console.log('✅ Auth State Updated:');
          console.log('  isAuthenticated:', true);
          console.log('  roleName:', roleName);
          console.log('  isSuperAdmin:', isSuperAdmin);
          console.log('  accessibleTabs:', accessibleTabs);

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
          localStorage.removeItem('supabaseSession');
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
        const sessionStr = localStorage.getItem('supabaseSession');
        if (!sessionStr) {
          set({ isLoading: false, isAuthenticated: false });
          return null;
        }

        set({ isLoading: true });

        try {
          const { data: { user: supabaseUser } } = await supabase.auth.getUser();
          
          if (!supabaseUser) {
            set({ isLoading: false, isAuthenticated: false });
            return null;
          }

          const profile = await authAPI.getProfile();
          
          console.log('🔄 Load User Profile:', JSON.stringify(profile, null, 2));

          let roleData = profile?.role || null;
          let permissions = roleData?.permissions || null;
          let tabPermissions = roleData?.tab_permissions || null;
          let accessibleTabs = [];

          if (tabPermissions && typeof tabPermissions === 'object') {
            Object.keys(tabPermissions).forEach(tabKey => {
              if (tabPermissions[tabKey] === true) {
                accessibleTabs.push(tabKey);
              }
            });
          }

          const isSuperAdmin = roleData?.is_super_admin === true;
          const roleName = roleData?.name || 'user';
          
          if (isSuperAdmin || roleName === 'Super Admin' || roleName === 'Admin') {
            console.log('👑 Super Admin detected - granting all tab access');
            if (tabPermissions && typeof tabPermissions === 'object') {
              accessibleTabs = Object.keys(tabPermissions);
            } else {
              accessibleTabs = [
                'dashboard', 'add-driver', 'add-vehicle', 
                'driver-list', 'vehicle-list', 'users', 
                'ledgers', 'settings', 'admin'
              ];
            }
          }

          const user = {
            id: supabaseUser.id,
            email: supabaseUser.email || profile?.email || '',
            fullName: profile?.full_name || supabaseUser?.user_metadata?.full_name || '',
            firstName: profile?.full_name?.split(' ')[0] || '',
            lastName: profile?.full_name?.split(' ').slice(1).join(' ') || '',
            roleName: roleName,
            roleId: profile?.role_id || roleData?.id,
            status: profile?.status || 'active',
            role: roleData,
            permissions: permissions || {},
            tabPermissions: tabPermissions || {},
            isSuperAdmin: isSuperAdmin,
            profile: profile,
            user_metadata: supabaseUser?.user_metadata || {}
          };

          localStorage.setItem('user', JSON.stringify(user));

          set({ 
            user, 
            isAuthenticated: true, 
            role: roleData,
            permissions: permissions || {},
            tabPermissions: tabPermissions || {},
            accessibleTabs: accessibleTabs,
            isLoading: false, 
            error: null 
          });

          console.log('✅ Loaded accessibleTabs:', accessibleTabs);
          console.log('✅ Loaded role:', roleName);
          console.log('✅ Is Super Admin:', isSuperAdmin);

          return user;
        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('supabaseSession');
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

      hasPermission: (action) => {
        const { user, permissions } = get();
        if (!user) return false;
        
        const roleName = user.roleName || user.role?.name;
        const isSuperAdmin = user.isSuperAdmin || user.role?.is_super_admin === true;
        
        if (isSuperAdmin || roleName === 'Super Admin' || roleName === 'Admin') {
          return true;
        }
        
        return permissions?.[action] === true;
      },

      canAccessTab: (tabKey) => {
        const { user, accessibleTabs, role } = get();
        
        console.log(`🔍 Checking tab access for "${tabKey}":`);
        console.log('  User:', user?.email);
        console.log('  Accessible Tabs:', accessibleTabs);
        console.log('  Role:', role);
        
        if (!user) return false;
        
        const roleName = user.roleName || user.role?.name || role?.name;
        const isSuperAdmin = user.isSuperAdmin || user.role?.is_super_admin === true || role?.is_super_admin === true;
        
        console.log('  Role Name:', roleName);
        console.log('  Is Super Admin:', isSuperAdmin);
        
        if (isSuperAdmin || roleName === 'Super Admin' || roleName === 'Admin') {
          console.log('  ✅ Super Admin - granting access');
          return true;
        }
        
        const hasAccess = accessibleTabs.includes(tabKey);
        console.log(`  ${hasAccess ? '✅' : '❌'} Access granted:`, hasAccess);
        
        return hasAccess;
      },

      canViewLedgerData: () => {
        const { user } = get();
        if (!user) return false;
        return true;
      },

      canPerform: (action) => {
        return get().hasPermission(action);
      },

      getAccessibleTabs: () => {
        const { accessibleTabs, user } = get();
        
        const roleName = user?.roleName || user?.role?.name;
        const isSuperAdmin = user?.isSuperAdmin || user?.role?.is_super_admin === true;
        
        if (isSuperAdmin || roleName === 'Super Admin' || roleName === 'Admin') {
          return [
            'dashboard', 'add-driver', 'add-vehicle', 
            'driver-list', 'vehicle-list', 'users', 
            'ledgers', 'settings', 'admin'
          ];
        }
        
        return accessibleTabs;
      },

      hasRole: (role) => {
        const { user } = get();
        if (!user) return false;
        
        const userRole = user.roleName || user.role?.name;
        if (Array.isArray(role)) {
          return role.includes(userRole);
        }
        return userRole === role;
      },

      getFullName: () => {
        const { user } = get();
        if (!user) return '';
        return user.fullName || user.firstName || user.email || '';
      },

      refreshPermissions: async () => {
        const { user } = get();
        if (!user) return { success: false, error: 'No user logged in' };
        
        try {
          const profile = await authAPI.getProfile();
          
          console.log('🔄 Refreshed Profile:', JSON.stringify(profile, null, 2));

          let roleData = profile?.role || null;
          let permissions = roleData?.permissions || null;
          let tabPermissions = roleData?.tab_permissions || null;
          let accessibleTabs = [];

          if (tabPermissions && typeof tabPermissions === 'object') {
            Object.keys(tabPermissions).forEach(tabKey => {
              if (tabPermissions[tabKey] === true) {
                accessibleTabs.push(tabKey);
              }
            });
          }

          const isSuperAdmin = roleData?.is_super_admin === true;
          const roleName = roleData?.name || 'user';
          
          if (isSuperAdmin || roleName === 'Super Admin' || roleName === 'Admin') {
            if (tabPermissions && typeof tabPermissions === 'object') {
              accessibleTabs = Object.keys(tabPermissions);
            } else {
              accessibleTabs = [
                'dashboard', 'add-driver', 'add-vehicle', 
                'driver-list', 'vehicle-list', 'users', 
                'ledgers', 'settings', 'admin'
              ];
            }
          }
          
          set({
            role: roleData,
            permissions: permissions || {},
            tabPermissions: tabPermissions || {},
            accessibleTabs: accessibleTabs
          });
          
          const updatedUser = { 
            ...user, 
            permissions: permissions || {}, 
            tabPermissions: tabPermissions || {},
            role: roleData,
            roleName: roleName,
            isSuperAdmin: isSuperAdmin,
            profile: profile
          };
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

// Initialize auth on store creation
const initializeAuth = async () => {
  const store = useAuthStore.getState();
  const sessionStr = localStorage.getItem('supabaseSession');
  if (sessionStr) {
    await store.loadUser();
  } else {
    store.setState({ isLoading: false });
  }
};

initializeAuth();

// Listen for auth changes
authAPI.onAuthStateChange(async (event, session) => {
  console.log('🔔 Auth State Change:', event, session?.user?.email);
  
  const store = useAuthStore.getState();
  
  if (event === 'SIGNED_IN' && session?.user) {
    await store.loadUser();
  } else if (event === 'SIGNED_OUT') {
    store.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      role: null,
      permissions: null,
      tabPermissions: null,
      accessibleTabs: [],
      isLoading: false
    });
    localStorage.removeItem('supabaseSession');
    localStorage.removeItem('user');
  } else if (event === 'USER_UPDATED' && session?.user) {
    await store.refreshPermissions();
  }
});

export default useAuthStore;