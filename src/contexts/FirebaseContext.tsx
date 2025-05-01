
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useSupabase } from './SupabaseContext';
import { ActivityItem } from '@/types/friend';
import { UserSettings, DEFAULT_USER_SETTINGS } from '@/types/settings';
import { toast } from 'sonner';

// Create a context to wrap Firebase functions with Supabase equivalents
export interface FirebaseContextType {
  user: any;
  userSettings: UserSettings | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logOut: () => Promise<void>;
  getTasks: () => Promise<any[]>;
  createTask: (taskData: any) => Promise<any>;
  updateTask: (taskId: string, taskData: Partial<any>) => Promise<any>;
  deleteTask: (taskId: string) => Promise<void>;
  getCategories: () => Promise<any[]>;
  saveCategories: (categories: any[]) => Promise<void>;
  getWorkouts: () => Promise<any[]>;
  createWorkout: (workoutData: any) => Promise<any>;
  updateWorkout: (workoutId: string, workoutData: Partial<any>) => Promise<any>;
  deleteWorkout: (workoutId: string) => Promise<void>;
  getMeals: (date?: Date) => Promise<any[]>;
  createMeal: (mealData: any) => Promise<any>;
  updateMeal: (mealId: string, mealData: Partial<any>) => Promise<any>;
  deleteMeal: (mealId: string) => Promise<void>;
  getProgressLogs: () => Promise<any[]>;
  createProgressLog: (logData: any) => Promise<any>;
  getFitnessGoals: () => Promise<any | null>;
  updateFitnessGoals: (goals: any) => Promise<void>;
  getFriends: () => Promise<any[]>;
  getFriendRequests: () => Promise<any[]>;
  getFriendActivities: () => Promise<ActivityItem[]>;
  sendFriendRequest: (userId: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  getUserProfile: (userId: string) => Promise<any>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  exportUserData: (dataType: string, format: string) => Promise<any>;
  searchUsers: (query: string) => Promise<any[]>;
}

// Create the Firebase context
const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

// Provider component that wraps your app and makes Firebase/Supabase available to any child component that calls useFirebase()
export function FirebaseProvider({ children }: { children: ReactNode }) {
  const supabaseContext = useSupabase();
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  
  // Fetch user settings when user is available
  useEffect(() => {
    const fetchUserSettings = async () => {
      if (!supabaseContext.user) return;
      
      try {
        const profile = await supabaseContext.getUserProfile(supabaseContext.user.id);
        
        if (profile && profile.settings) {
          // Apply default settings for any missing properties
          setUserSettings({
            ...DEFAULT_USER_SETTINGS,
            ...profile.settings
          });
        } else {
          // If no settings found, use defaults
          setUserSettings(DEFAULT_USER_SETTINGS);
          // Initialize default settings in the database
          await updateUserSettings(DEFAULT_USER_SETTINGS);
        }
      } catch (error) {
        console.error('Error fetching user settings:', error);
        setUserSettings(DEFAULT_USER_SETTINGS);
      }
    };
    
    fetchUserSettings();
  }, [supabaseContext.user]);
  
  // Function to update user settings
  const updateUserSettings = async (settings: Partial<UserSettings>) => {
    if (!supabaseContext.user) throw new Error('User not authenticated');
    
    try {
      // Fetch current profile
      const profile = await supabaseContext.getUserProfile(supabaseContext.user.id);
      
      // Merge new settings with existing settings
      const updatedSettings = {
        ...(profile?.settings || DEFAULT_USER_SETTINGS),
        ...settings
      };
      
      // Apply theme-related settings
      if (settings.darkMode !== undefined) {
        // We'll handle theme toggling separately in the UI layer
        // through ThemeContext and ModeToggle
      }
      
      // Apply RTL settings
      if (settings.rtlLayout !== undefined) {
        document.documentElement.dir = settings.rtlLayout ? 'rtl' : 'ltr';
      }
      
      // Update profile
      await supabaseContext.updateUserProfile({
        settings: updatedSettings
      });
      
      // Update local state
      setUserSettings(updatedSettings as UserSettings);
      return updatedSettings;
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
      throw error;
    }
  };
  
  // Map Supabase functions to Firebase function names
  const value: FirebaseContextType = {
    user: supabaseContext.user,
    userSettings: userSettings,
    loading: supabaseContext.loading || !userSettings,
    signIn: supabaseContext.signIn,
    signUp: supabaseContext.signUp,
    logOut: supabaseContext.signOut,
    getTasks: supabaseContext.getTasks,
    createTask: supabaseContext.createTask,
    updateTask: supabaseContext.updateTask,
    deleteTask: supabaseContext.deleteTask,
    getCategories: supabaseContext.getCategories,
    saveCategories: supabaseContext.saveCategories,
    getWorkouts: supabaseContext.getWorkouts,
    createWorkout: supabaseContext.createWorkout,
    updateWorkout: supabaseContext.updateWorkout,
    deleteWorkout: supabaseContext.deleteWorkout,
    getMeals: supabaseContext.getMeals,
    createMeal: supabaseContext.createMeal,
    updateMeal: supabaseContext.updateMeal,
    deleteMeal: supabaseContext.deleteMeal,
    getProgressLogs: async () => [], // Placeholder - implement when needed
    createProgressLog: async () => ({}), // Placeholder - implement when needed
    getFitnessGoals: supabaseContext.getFitnessGoals,
    updateFitnessGoals: supabaseContext.updateFitnessGoals,
    getFriends: supabaseContext.getFriends,
    getFriendRequests: supabaseContext.getFriendRequests,
    getFriendActivities: async () => [], // Placeholder implementation for friend activities
    sendFriendRequest: supabaseContext.sendFriendRequest,
    acceptFriendRequest: supabaseContext.acceptFriendRequest,
    rejectFriendRequest: supabaseContext.rejectFriendRequest,
    removeFriend: supabaseContext.removeFriend,
    getUserProfile: supabaseContext.getUserProfile || (async (userId) => ({ 
      id: userId, 
      displayName: 'User',
      settings: { publicProfile: true, shareProgress: false, shareFitness: false },
      progressData: { progress: [] },
      fitnessData: { workouts: [] }
    })),
    updateSettings: updateUserSettings,
    exportUserData: async () => "", // Placeholder
    searchUsers: async (query) => {
      console.log('Searching users with query:', query);
      // Use the new searchUsersByName function if available
      if (supabaseContext.searchUsersByName) {
        return supabaseContext.searchUsersByName(query);
      }
      return []; // Fallback
    }
  };

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
}

// Custom hook for using Firebase
export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}
