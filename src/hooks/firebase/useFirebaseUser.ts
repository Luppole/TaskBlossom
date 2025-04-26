
import { useContext } from 'react';
import { FirebaseContext, FirebaseContextType } from '@/contexts/FirebaseContext';
import { auth } from '@/lib/firebase';

export const useFirebaseUser = () => {
  const context = useContext(FirebaseContext);
  
  // If the context is not available, provide a fallback
  // This is a workaround for the circular dependency during initialization
  if (!context) {
    return {
      user: auth.currentUser, // Use the current user directly from auth
      loading: true,          // Assume loading state is true
      userSettings: null,     // No settings available without context
    };
  }
  
  return {
    user: context.user,
    loading: context.loading,
    userSettings: context.userSettings,
  };
};
