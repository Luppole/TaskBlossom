
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthOperations } from '@/hooks/firebase/useAuthOperations';
import { useTaskOperations } from '@/hooks/firebase/useTaskOperations';
import { useCategoryOperations } from '@/hooks/firebase/useCategoryOperations';
import { useFitnessOperations } from '@/hooks/firebase/useFitnessOperations';
import { useFriendOperations } from '@/hooks/firebase/useFriendOperations';
import { useSettingsOperations } from '@/hooks/firebase/useSettingsOperations';
import { UserSettings } from '@/types/settings';

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
  
  const { loadUserSettings } = useSettingsOperations();

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
  }, [loadUserSettings]);

  const value = {
    user,
    loading,
    userSettings,
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

// Create an interface for the combined hook return type
export interface FirebaseHookReturnType extends FirebaseContextType {
  // Add methods from other hooks as needed
  [key: string]: any;
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return {
    ...context,
    ...useAuthOperations(),
    ...useTaskOperations(),
    ...useCategoryOperations(),
    ...useFitnessOperations(),
    ...useFriendOperations(),
    ...useSettingsOperations(),
  } as FirebaseHookReturnType;
};
