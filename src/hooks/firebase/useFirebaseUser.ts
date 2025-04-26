
import { useContext } from 'react';
import { FirebaseContext } from '@/contexts/FirebaseContext';

export const useFirebaseUser = () => {
  const context = useContext(FirebaseContext);
  
  // Check if the context exists to avoid errors
  if (context === null) {
    // Return a default state
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
