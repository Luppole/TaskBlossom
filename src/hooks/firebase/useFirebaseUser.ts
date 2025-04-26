
import { useContext } from 'react';
import { FirebaseContext } from '@/contexts/FirebaseContext';

export const useFirebaseUser = () => {
  const context = useContext(FirebaseContext);
  
  // Check if the context exists to avoid errors
  if (context === null) {
    // Instead of immediately throwing an error, return a default state
    // This helps break circular dependencies when components initialize
    return {
      user: null,
      loading: true,
      userSettings: null
    };
  }
  
  return {
    user: context.user,
    loading: context.loading,
    userSettings: context.userSettings,
  };
};
