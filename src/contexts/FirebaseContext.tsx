
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useAuthOperations } from '@/hooks/firebase/useAuthOperations';
import { useTaskOperations } from '@/hooks/firebase/useTaskOperations';
import { useCategoryOperations } from '@/hooks/firebase/useCategoryOperations';
import { useFitnessOperations } from '@/hooks/firebase/useFitnessOperations';
import { useFriendOperations } from '@/hooks/firebase/useFriendOperations';
import { useSettingsOperations } from '@/hooks/firebase/useSettingsOperations';
import { UserSettings } from '@/types/settings';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { defaultUserSettings } from '@/lib/constants';
import { Task } from '@/types/task';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

export interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  userSettings: UserSettings | null;
}

export const FirebaseContext = createContext<FirebaseContextType | null>(null);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  
  // Load tasks from localStorage if user is not signed in
  useEffect(() => {
    const loadLocalTasks = () => {
      try {
        const savedTasks = localStorage.getItem('guest_tasks');
        if (savedTasks) {
          setLocalTasks(JSON.parse(savedTasks));
        }
      } catch (error) {
        console.error('Error loading tasks from localStorage:', error);
      }
    };
    
    if (!user) {
      loadLocalTasks();
    }
  }, [user]);
  
  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (!user && localTasks.length > 0) {
      try {
        localStorage.setItem('guest_tasks', JSON.stringify(localTasks));
      } catch (error) {
        console.error('Error saving tasks to localStorage:', error);
      }
    }
  }, [localTasks, user]);
  
  // Instead of using useSettingsOperations which would cause circular dependency,
  // we'll implement the loadUserSettings function directly here
  const loadUserSettings = async (userId: string) => {
    try {
      const settingsRef = doc(db, 'userSettings', userId);
      const settingsDoc = await getDoc(settingsRef);
      
      if (settingsDoc.exists()) {
        return settingsDoc.data() as UserSettings;
      }
      
      await setDoc(settingsRef, defaultUserSettings);
      return defaultUserSettings;
    } catch (error) {
      console.error('Error loading user settings:', error);
      return defaultUserSettings;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          const settings = await loadUserSettings(user.uid);
          setUserSettings(settings);
        } catch (error) {
          console.error("Error loading user settings:", error);
          setUserSettings(null);
        }
      } else {
        setUserSettings(null);
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Local task operations for guest users
  const createLocalTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const now = new Date();
    const newTask: Task = {
      ...taskData,
      id: uuidv4(),
      createdAt: now,
      notes: taskData.notes || null
    };
    
    setLocalTasks(prev => [newTask, ...prev]);
    return newTask;
  };
  
  const updateLocalTask = (taskId: string, data: Partial<Task>) => {
    setLocalTasks(prev => 
      prev.map(task => task.id === taskId ? { ...task, ...data } : task)
    );
  };
  
  const deleteLocalTask = (taskId: string) => {
    setLocalTasks(prev => prev.filter(task => task.id !== taskId));
  };
  
  const getLocalTasks = () => {
    return localTasks;
  };

  const value = {
    user,
    loading,
    userSettings,
    localTasks,
    createLocalTask,
    updateLocalTask,
    deleteLocalTask,
    getLocalTasks,
  };

  return (
    <FirebaseContext.Provider value={value as any}>
      {children}
    </FirebaseContext.Provider>
  );
};

// Create an interface for the combined hook return type
export interface FirebaseHookReturnType extends FirebaseContextType {
  // Add methods from other hooks as needed
  [key: string]: any;
  createLocalTask: (taskData: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateLocalTask: (taskId: string, data: Partial<Task>) => void;
  deleteLocalTask: (taskId: string) => void;
  getLocalTasks: () => Task[];
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  
  const authOperations = useAuthOperations();
  const taskOperations = useTaskOperations();
  const categoryOperations = useCategoryOperations();
  const fitnessOperations = useFitnessOperations();
  const friendOperations = useFriendOperations();
  const settingsOperations = useSettingsOperations();
  const navigate = useNavigate();
  
  // Add a method to redirect to settings for sign-in
  const redirectToSignIn = () => {
    navigate('/settings');
  };
  
  return {
    ...context,
    ...authOperations,
    ...taskOperations,
    ...categoryOperations,
    ...fitnessOperations,
    ...friendOperations,
    ...settingsOperations,
    redirectToSignIn,
  } as FirebaseHookReturnType;
};
