
import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc, setDoc, query, orderBy, Timestamp, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { WorkoutSession, MealLog, ProgressLog, FitnessGoals } from '@/types/task';
import { useFirebaseUser } from './useFirebaseUser';
import { convertFirebaseTimestamp } from '@/utils/firebaseHelpers';

export const useFitnessOperations = () => {
  const { user } = useFirebaseUser();

  // Workout operations
  const getWorkouts = async () => {
    if (!user) return [];
    
    try {
      const workoutsRef = collection(db, 'users', user.uid, 'workouts');
      const q = query(workoutsRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          date: (data.date as Timestamp).toDate(),
          exercises: data.exercises || []
        } as WorkoutSession;
      });
    } catch (error) {
      console.error('Error getting workouts:', error);
      return [];
    }
  };

  const createWorkout = async (workoutData: Omit<WorkoutSession, 'id'>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const workoutRef = collection(db, 'users', user.uid, 'workouts');
      
      const firestoreWorkout = {
        ...workoutData,
        date: Timestamp.fromDate(workoutData.date),
        userId: user.uid
      };
      
      const docRef = await addDoc(workoutRef, firestoreWorkout);
      
      return {
        ...workoutData,
        id: docRef.id
      } as WorkoutSession;
    } catch (error) {
      console.error('Error creating workout:', error);
      throw error;
    }
  };

  const updateWorkout = async (workoutId: string, data: Partial<WorkoutSession>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const workoutRef = doc(db, 'users', user.uid, 'workouts', workoutId);
      
      const firestoreData: Record<string, any> = { ...data };
      
      if (firestoreData.date instanceof Date) {
        firestoreData.date = Timestamp.fromDate(firestoreData.date);
      }
      
      await updateDoc(workoutRef, firestoreData);
    } catch (error) {
      console.error('Error updating workout:', error);
      throw error;
    }
  };

  const deleteWorkout = async (workoutId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const workoutRef = doc(db, 'users', user.uid, 'workouts', workoutId);
      await deleteDoc(workoutRef);
    } catch (error) {
      console.error('Error deleting workout:', error);
      throw error;
    }
  };

  // Meal operations
  const getMeals = async (date?: Date) => {
    if (!user) return [];
    
    try {
      const mealsRef = collection(db, 'users', user.uid, 'meals');
      let q;
      
      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        q = query(
          mealsRef, 
          where('date', '>=', Timestamp.fromDate(startOfDay)),
          where('date', '<=', Timestamp.fromDate(endOfDay)),
          orderBy('date', 'asc')
        );
      } else {
        q = query(mealsRef, orderBy('date', 'desc'));
      }
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          date: convertFirebaseTimestamp(data.date) || new Date(),
          mealType: data.mealType as MealLog['mealType'] || 'snack',
          foods: Array.isArray(data.foods) ? data.foods : [],
          notes: data.notes || null,
          userId: data.userId
        } as MealLog;
      });
    } catch (error) {
      console.error('Error getting meals:', error);
      return [];
    }
  };

  const createMeal = async (mealData: Omit<MealLog, 'id'>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const mealRef = collection(db, 'users', user.uid, 'meals');
      
      const firestoreMeal = {
        ...mealData,
        date: Timestamp.fromDate(mealData.date),
        userId: user.uid
      };
      
      const docRef = await addDoc(mealRef, firestoreMeal);
      
      return {
        ...mealData,
        id: docRef.id
      } as MealLog;
    } catch (error) {
      console.error('Error creating meal:', error);
      throw error;
    }
  };

  const updateMeal = async (mealId: string, data: Partial<MealLog>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const mealRef = doc(db, 'users', user.uid, 'meals', mealId);
      
      const firestoreData: Record<string, any> = { ...data };
      
      if (firestoreData.date instanceof Date) {
        firestoreData.date = Timestamp.fromDate(firestoreData.date);
      }
      
      await updateDoc(mealRef, firestoreData);
    } catch (error) {
      console.error('Error updating meal:', error);
      throw error;
    }
  };

  const deleteMeal = async (mealId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const mealRef = doc(db, 'users', user.uid, 'meals', mealId);
      await deleteDoc(mealRef);
    } catch (error) {
      console.error('Error deleting meal:', error);
      throw error;
    }
  };

  // Progress operations
  const getProgressLogs = async () => {
    if (!user) return [];
    
    try {
      const logsRef = collection(db, 'users', user.uid, 'progress');
      const q = query(logsRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          date: (data.date as Timestamp).toDate()
        } as ProgressLog;
      });
    } catch (error) {
      console.error('Error getting progress logs:', error);
      return [];
    }
  };

  const createProgressLog = async (logData: Omit<ProgressLog, 'id'>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const logRef = collection(db, 'users', user.uid, 'progress');
      
      const firestoreLog = {
        ...logData,
        date: Timestamp.fromDate(logData.date),
        userId: user.uid
      };
      
      const docRef = await addDoc(logRef, firestoreLog);
      
      return {
        ...logData,
        id: docRef.id
      } as ProgressLog;
    } catch (error) {
      console.error('Error creating progress log:', error);
      throw error;
    }
  };

  // Goals operations
  const getFitnessGoals = async () => {
    if (!user) return null;
    
    try {
      const goalsRef = doc(db, 'users', user.uid, 'fitness', 'goals');
      const goalsDoc = await getDoc(goalsRef);
      
      if (goalsDoc.exists()) {
        return goalsDoc.data() as FitnessGoals;
      } else {
        const defaultGoals: FitnessGoals = {
          dailyCalorieGoal: 2000,
          weeklyWorkoutGoal: 3
        };
        
        await setDoc(goalsRef, defaultGoals);
        return defaultGoals;
      }
    } catch (error) {
      console.error('Error getting fitness goals:', error);
      return null;
    }
  };

  const updateFitnessGoals = async (goals: FitnessGoals) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const goalsRef = doc(db, 'users', user.uid, 'fitness', 'goals');
      await setDoc(goalsRef, goals);
    } catch (error) {
      console.error('Error updating fitness goals:', error);
      throw error;
    }
  };

  return {
    getWorkouts,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    getMeals,
    createMeal,
    updateMeal,
    deleteMeal,
    getProgressLogs,
    createProgressLog,
    getFitnessGoals,
    updateFitnessGoals,
  };
};
