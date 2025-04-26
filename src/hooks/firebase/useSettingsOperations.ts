
import { doc, getDoc, updateDoc, setDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserSettings } from '@/types/settings';
import { useFirebaseUser } from './useFirebaseUser';
import { defaultUserSettings } from '@/lib/constants';
import { convertFirebaseTimestamp, convertFirebaseTimestamps } from '@/utils/firebaseHelpers';

export const useSettingsOperations = () => {
  // This will no longer throw an error if called during initialization
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

  const exportUserData = async (dataType: 'meals' | 'workouts' | 'progress', format: 'csv' | 'pdf'): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    try {
      let collectionPath = '';
      
      // Determine the collection path based on data type
      switch (dataType) {
        case 'meals':
          collectionPath = `users/${user.uid}/meals`;
          break;
        case 'workouts':
          collectionPath = `users/${user.uid}/workouts`;
          break;
        case 'progress':
          collectionPath = `users/${user.uid}/progress`;
          break;
      }

      // Get data from Firestore
      const dataRef = collection(db, collectionPath);
      const q = query(dataRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      
      const items = snapshot.docs.map(doc => {
        const data = doc.data();
        // Convert any Timestamps to regular dates
        return {
          id: doc.id,
          ...convertFirebaseTimestamps(data)
        };
      });

      // Format the data based on the requested format
      if (format === 'csv') {
        return convertToCSV(items);
      } else {
        // For PDF, we'll return JSON for now as actual PDF generation would require more libraries
        return JSON.stringify(items, null, 2);
      }
    } catch (error) {
      console.error(`Error exporting ${dataType} data:`, error);
      throw error;
    }
  };

  // Helper function to convert data to CSV format
  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return '';
    
    // Get all possible headers from all objects
    const headers = new Set<string>();
    data.forEach(item => {
      Object.keys(item).forEach(key => headers.add(key));
    });
    
    // Convert Set to Array and filter out any complex objects that can't be represented in CSV
    const headerArray = Array.from(headers).filter(header => {
      const sample = data.find(item => item[header] !== undefined);
      return sample && 
        (typeof sample[header] !== 'object' || 
         sample[header] instanceof Date || 
         sample[header] === null);
    });
    
    // Create CSV header row
    let csv = headerArray.join(',') + '\n';
    
    // Add data rows
    data.forEach(item => {
      const row = headerArray.map(header => {
        const value = item[header];
        
        // Handle different types of values
        if (value === undefined || value === null) {
          return '';
        } else if (value instanceof Date) {
          return value.toISOString();
        } else if (typeof value === 'string') {
          // Escape quotes and wrap in quotes if contains comma
          const escaped = value.replace(/"/g, '""');
          return escaped.includes(',') ? `"${escaped}"` : escaped;
        } else {
          return value.toString();
        }
      });
      
      csv += row.join(',') + '\n';
    });
    
    return csv;
  };

  return {
    loadUserSettings,
    updateSettings,
    exportUserData,
  };
};
