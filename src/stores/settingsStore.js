import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSettingsStore = create(
  persist(
    (set) => ({
      // General Settings
      companyName: 'JadeedFleet Pro',
      companyEmail: 'info@jadeedfleet.com',
      companyPhone: '+92 300 1234567',
      companyAddress: 'Karachi, Pakistan',
      
      // Theme Settings
      theme: 'light',
      
      // Notification Settings
      emailNotifications: true,
      pushNotifications: true,
      loginAlerts: true,
      
      // Display Settings
      itemsPerPage: 20,
      dateFormat: 'DD/MM/YYYY',
      timezone: 'Asia/Karachi',
      
      // Security Settings
      twoFactorAuth: false,
      sessionTimeout: 30,
      
      // Backup Settings
      autoBackup: false,
      backupFrequency: 'weekly',
      
      // Actions
      updateGeneralSettings: (data) => set(data),
      updateTheme: (theme) => set({ theme }),
      toggleEmailNotifications: () => set((state) => ({ emailNotifications: !state.emailNotifications })),
      togglePushNotifications: () => set((state) => ({ pushNotifications: !state.pushNotifications })),
      toggleLoginAlerts: () => set((state) => ({ loginAlerts: !state.loginAlerts })),
      updateDisplaySettings: (data) => set(data),
      toggleTwoFactorAuth: () => set((state) => ({ twoFactorAuth: !state.twoFactorAuth })),
      updateSessionTimeout: (sessionTimeout) => set({ sessionTimeout }),
      toggleAutoBackup: () => set((state) => ({ autoBackup: !state.autoBackup })),
      updateBackupFrequency: (backupFrequency) => set({ backupFrequency }),
      resetToDefault: () => set({
        companyName: 'JadeedFleet Pro',
        companyEmail: 'info@jadeedfleet.com',
        companyPhone: '+92 300 1234567',
        companyAddress: 'Karachi, Pakistan',
        theme: 'light',
        emailNotifications: true,
        pushNotifications: true,
        loginAlerts: true,
        itemsPerPage: 20,
        dateFormat: 'DD/MM/YYYY',
        timezone: 'Asia/Karachi',
        twoFactorAuth: false,
        sessionTimeout: 30,
        autoBackup: false,
        backupFrequency: 'weekly',
      }),
    }),
    {
      name: 'settings-storage',
    }
  )
);

export default useSettingsStore;