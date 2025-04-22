
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc, 
  onSnapshot, 
  Timestamp 
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Task, TaskCategory } from '@/types/task';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  userSettings: UserSettings | null;
  createAccount: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  getTasks: () => Promise<Task[]>;
  createTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<Task>;
  updateTask: (taskId: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  saveCategories: (categories: TaskCategory[]) => Promise<void>;
  getCategories: () => Promise<TaskCategory[]>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
}

export interface UserSettings {
  darkMode: boolean;
  defaultView: 'today' | 'calendar' | 'tasks';
  pushNotifications: boolean;
  taskReminders: boolean;
  overdueAlerts: boolean;
  rtlLayout: boolean;
}

const defaultUserSettings: UserSettings = {
  darkMode: false,
  defaultView: 'today',
  pushNotifications: false,
  taskReminders: false,
  overdueAlerts: false,
  rtlLayout: false
};

const FirebaseContext = createContext<FirebaseContextType | null>(null);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Load user settings if the user is logged in
        await loadUserSettings(user.uid);
      } else {
        setUserSettings(null);
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Load user settings
  const loadUserSettings = async (userId: string) => {
    try {
      const settingsRef = doc(db, 'userSettings', userId);
      const settingsDoc = await getDoc(settingsRef);
      
      if (settingsDoc.exists()) {
        setUserSettings(settingsDoc.data() as UserSettings);
      } else {
        // Initialize default settings for new users
        await setDoc(settingsRef, defaultUserSettings);
        setUserSettings(defaultUserSettings);
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
      setUserSettings(defaultUserSettings);
    }
  };

  // Authentication functions
  const createAccount = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(userCredential.user, { displayName });
      
      // Initialize user settings
      const settingsRef = doc(db, 'userSettings', userCredential.user.uid);
      await setDoc(settingsRef, defaultUserSettings);
      
      return;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Task management functions
  const getTasks = async () => {
    if (!user) return [];
    
    try {
      const tasksRef = collection(db, 'users', user.uid, 'tasks');
      const q = query(tasksRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          dueDate: data.dueDate ? (data.dueDate as Timestamp).toDate() : undefined,
          createdAt: (data.createdAt as Timestamp).toDate()
        } as Task;
      });
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  };

  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const taskRef = doc(collection(db, 'users', user.uid, 'tasks'));
      const now = new Date();
      
      const task: Task = {
        ...taskData,
        id: taskRef.id,
        createdAt: now
      };
      
      // Convert Date objects to Firestore Timestamps
      const firestoreTask = {
        ...task,
        dueDate: task.dueDate ? Timestamp.fromDate(task.dueDate) : null,
        createdAt: Timestamp.fromDate(now)
      };
      
      await setDoc(taskRef, firestoreTask);
      return task;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  const updateTask = async (taskId: string, data: Partial<Task>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
      
      // Convert Date objects to Firestore Timestamps if present
      const updateData = { ...data };
      if (updateData.dueDate) {
        updateData.dueDate = Timestamp.fromDate(updateData.dueDate);
      }
      
      await updateDoc(taskRef, updateData);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  // Category management
  const getCategories = async () => {
    if (!user) return [];
    
    try {
      const categoriesRef = collection(db, 'users', user.uid, 'categories');
      const querySnapshot = await getDocs(categoriesRef);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TaskCategory));
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  };

  const saveCategories = async (categories: TaskCategory[]) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Batch write all categories
      for (const category of categories) {
        const categoryRef = doc(db, 'users', user.uid, 'categories', category.id);
        await setDoc(categoryRef, {
          name: category.name,
          color: category.color
        });
      }
    } catch (error) {
      console.error('Error saving categories:', error);
      throw error;
    }
  };

  // Settings management
  const updateSettings = async (settings: Partial<UserSettings>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const settingsRef = doc(db, 'userSettings', user.uid);
      await updateDoc(settingsRef, settings);
      
      // Update local state
      setUserSettings(prev => prev ? { ...prev, ...settings } : null);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    userSettings,
    createAccount,
    signIn,
    logOut,
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    saveCategories,
    getCategories,
    updateSettings
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
