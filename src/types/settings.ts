
export interface UserSettings {
  darkMode: boolean;
  defaultView: 'today' | 'calendar' | 'tasks';
  pushNotifications: boolean;
  taskReminders: boolean;
  overdueAlerts: boolean;
  rtlLayout: boolean;
  publicProfile: boolean;
  shareProgress: boolean;
  shareFitness: boolean;
}

// Default settings with publicProfile set to true by default
export const DEFAULT_USER_SETTINGS: UserSettings = {
  darkMode: false,
  defaultView: 'today',
  pushNotifications: true,
  taskReminders: true,
  overdueAlerts: true,
  rtlLayout: false,
  publicProfile: true, // Public by default
  shareProgress: false,
  shareFitness: false
};
