
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserSettings } from '@/types/settings';
import { useFirebaseUser } from './useFirebaseUser';
import { defaultUserSettings } from '@/lib/constants';

export const useSettingsOperations = () => {
  const { user } = useFirebaseUser();

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

  const updateSettings = async (settings: Partial<UserSettings>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const settingsRef = doc(db, 'userSettings', user.uid);
      await updateDoc(settingsRef, settings);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  return {
    loadUserSettings,
    updateSettings,
  };
};
