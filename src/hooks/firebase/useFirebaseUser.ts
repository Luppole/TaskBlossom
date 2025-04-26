
import { useContext } from 'react';
import { FirebaseContext, FirebaseContextType } from '@/contexts/FirebaseContext';

export const useFirebaseUser = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebaseUser must be used within a FirebaseProvider');
  }
  return {
    user: context.user,
    loading: context.loading,
    userSettings: context.userSettings,
  };
};
