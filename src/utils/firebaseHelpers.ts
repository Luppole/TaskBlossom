
import { Timestamp } from 'firebase/firestore';

/**
 * Safely converts a Firebase Timestamp to a JavaScript Date
 * @param value - The value to convert, can be Timestamp, Date, or other
 * @returns A JavaScript Date object or null if conversion is not possible
 */
export const convertFirebaseTimestamp = (value: any): Date | null => {
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  
  if (value instanceof Date) {
    return value;
  }
  
  // Try to handle string dates or timestamps
  if (typeof value === 'string' || typeof value === 'number') {
    try {
      return new Date(value);
    } catch (e) {
      console.error('Could not convert value to Date:', e);
      return null;
    }
  }
  
  return null;
};

/**
 * Takes a Firebase document data and returns a new object with all Timestamps converted to Dates
 * @param data - The document data from Firestore
 * @returns A new object with all Timestamps converted to Dates
 */
export const convertFirebaseTimestamps = <T extends Record<string, any>>(data: T): Record<string, any> => {
  if (!data) return data;
  
  const result: Record<string, any> = { ...data };
  
  Object.keys(result).forEach(key => {
    const value = result[key];
    
    if (value instanceof Timestamp) {
      result[key] = value.toDate();
    } else if (typeof value === 'object' && value !== null) {
      result[key] = convertFirebaseTimestamps(value);
    }
  });
  
  return result as T;
};
