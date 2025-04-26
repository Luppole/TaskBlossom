
import { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { defaultUserSettings } from '@/lib/constants';
import { toast } from 'sonner';

export const useAuthOperations = () => {
  const createAccount = async (email: string, password: string, displayName: string) => {
    if (!email) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      
      const settingsRef = doc(db, 'userSettings', userCredential.user.uid);
      await setDoc(settingsRef, defaultUserSettings);
      
      return;
    } catch (error: any) {
      console.error('Error creating account:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!email) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      toast.success('Successfully signed out');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return {
    createAccount,
    signIn,
    logOut,
  };
};
