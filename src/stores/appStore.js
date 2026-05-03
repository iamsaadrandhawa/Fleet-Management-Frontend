import { create } from 'zustand';

const useAppStore = create((set) => ({
  // UI State
  sidebarOpen: true,
  theme: 'light',
  notifications: [],
  activePage: 'dashboard',

  // Actions
  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  
  setTheme: (theme) => set({ theme }),
  
  addNotification: (notification) => set(state => ({
    notifications: [{ id: Date.now(), ...notification, read: false }, ...state.notifications]
  })),
  
  markNotificationRead: (id) => set(state => ({
    notifications: state.notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    )
  })),
  
  clearNotifications: () => set({ notifications: [] }),
  
  setActivePage: (page) => set({ activePage: page }),
}));

export default useAppStore;