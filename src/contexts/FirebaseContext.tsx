
import { createContext, useContext, ReactNode } from 'react';
import { useSupabase } from './SupabaseContext';

// Create a context to wrap Firebase functions with Supabase equivalents
export interface FirebaseContextType {
  user: any;
  userSettings: any;
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
  sendFriendRequest: (userId: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  getUserProfile: (userId: string) => Promise<any>;
  updateSettings: (settings: any) => Promise<void>;
  exportUserData: (dataType: string, format: string) => Promise<any>;
  searchUsers: (query: string) => Promise<any[]>;
}

// Create the Firebase context
const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

// Provider component that wraps your app and makes Firebase/Supabase available to any child component that calls useFirebase()
export function FirebaseProvider({ children }: { children: ReactNode }) {
  const supabaseContext = useSupabase();
  
  // Map Supabase functions to Firebase function names
  const value: FirebaseContextType = {
    user: supabaseContext.user,
    userSettings: {}, // This will need to be fetched from Supabase
    loading: supabaseContext.loading,
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
    sendFriendRequest: supabaseContext.sendFriendRequest,
    acceptFriendRequest: supabaseContext.acceptFriendRequest,
    rejectFriendRequest: supabaseContext.rejectFriendRequest,
    removeFriend: supabaseContext.removeFriend,
    getUserProfile: async (userId) => ({ 
      id: userId, 
      displayName: 'User',
      settings: { publicProfile: false, shareProgress: false, shareFitness: false },
      progressData: { progress: [] },
      fitnessData: { workouts: [] }
    }), // Placeholder
    updateSettings: async () => {}, // Placeholder
    exportUserData: async () => "", // Placeholder
    searchUsers: async () => [] // Placeholder
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
