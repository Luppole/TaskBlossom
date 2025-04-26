import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc, 
  onSnapshot, 
  Timestamp,
  addDoc,
  DocumentData,
  limit
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Task, TaskCategory, WorkoutSession, MealLog, FoodItem, Exercise, ProgressLog, FitnessGoals } from '@/types/task';
import { FriendRequest, FriendData, ActivityItem } from '@/types/friend';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  userSettings: UserSettings | null;
  createAccount: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  getTasks: () => Promise<Task[]>;
  createTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<Task>;
  updateTask: (taskId: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  saveCategories: (categories: TaskCategory[]) => Promise<void>;
  getCategories: () => Promise<TaskCategory[]>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  getWorkouts: () => Promise<WorkoutSession[]>;
  createWorkout: (workout: Omit<WorkoutSession, 'id'>) => Promise<WorkoutSession>;
  updateWorkout: (workoutId: string, data: Partial<WorkoutSession>) => Promise<void>;
  deleteWorkout: (workoutId: string) => Promise<void>;
  getMeals: (date?: Date) => Promise<MealLog[]>;
  createMeal: (meal: Omit<MealLog, 'id'>) => Promise<MealLog>;
  updateMeal: (mealId: string, data: Partial<MealLog>) => Promise<void>;
  deleteMeal: (mealId: string) => Promise<void>;
  getProgressLogs: () => Promise<ProgressLog[]>;
  createProgressLog: (log: Omit<ProgressLog, 'id'>) => Promise<ProgressLog>;
  getFitnessGoals: () => Promise<FitnessGoals | null>;
  updateFitnessGoals: (goals: FitnessGoals) => Promise<void>;
  sendFriendRequest: (recipientId: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;
  getFriendRequests: () => Promise<FriendRequest[]>;
  getFriends: () => Promise<FriendData[]>;
  removeFriend: (friendId: string) => Promise<void>;
  getFriendActivities: () => Promise<ActivityItem[]>;
  getUserProfile: (userId: string) => Promise<any>;
  exportUserData: (dataType: 'meals' | 'workouts' | 'progress', format: 'csv' | 'pdf') => Promise<string>;
}

export interface UserSettings {
  darkMode: boolean;
  defaultView: 'today' | 'calendar' | 'tasks';
  pushNotifications: boolean;
  taskReminders: boolean;
  overdueAlerts: boolean;
  rtlLayout: boolean;
  publicProfile: boolean;
  shareProgress: boolean;
  shareFitness: boolean;
}

const defaultUserSettings: UserSettings = {
  darkMode: false,
  defaultView: 'today',
  pushNotifications: false,
  taskReminders: false,
  overdueAlerts: false,
  rtlLayout: false,
  publicProfile: false,
  shareProgress: false,
  shareFitness: false
};

const FirebaseContext = createContext<FirebaseContextType | null>(null);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        await loadUserSettings(user.uid);
      } else {
        setUserSettings(null);
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const loadUserSettings = async (userId: string) => {
    try {
      const settingsRef = doc(db, 'userSettings', userId);
      const settingsDoc = await getDoc(settingsRef);
      
      if (settingsDoc.exists()) {
        setUserSettings(settingsDoc.data() as UserSettings);
      } else {
        await setDoc(settingsRef, defaultUserSettings);
        setUserSettings(defaultUserSettings);
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
      setUserSettings(defaultUserSettings);
    }
  };

  const createAccount = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(userCredential.user, { displayName });
      
      const settingsRef = doc(db, 'userSettings', userCredential.user.uid);
      await setDoc(settingsRef, defaultUserSettings);
      
      return;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const getTasks = async () => {
    if (!user) return [];
    
    try {
      const tasksRef = collection(db, 'users', user.uid, 'tasks');
      const q = query(tasksRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          dueDate: data.dueDate ? (data.dueDate as Timestamp).toDate() : undefined,
          createdAt: (data.createdAt as Timestamp).toDate(),
          notes: data.notes || null
        } as Task;
      });
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  };

  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const taskRef = doc(collection(db, 'users', user.uid, 'tasks'));
      const now = new Date();
      
      const task: Task = {
        ...taskData,
        id: taskRef.id,
        createdAt: now,
        notes: taskData.notes || null
      };
      
      const firestoreTask = {
        ...task,
        dueDate: task.dueDate ? Timestamp.fromDate(task.dueDate) : null,
        createdAt: Timestamp.fromDate(now),
        notes: task.notes || null
      };
      
      await setDoc(taskRef, firestoreTask);
      return task;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  const updateTask = async (taskId: string, data: Partial<Task>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
      
      const firestoreData: Record<string, any> = { ...data };
      
      if (firestoreData.dueDate instanceof Date) {
        firestoreData.dueDate = Timestamp.fromDate(firestoreData.dueDate);
      }
      
      if ('notes' in firestoreData && firestoreData.notes === undefined) {
        firestoreData.notes = null;
      }
      
      await updateDoc(taskRef, firestoreData);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  const getCategories = async () => {
    if (!user) return [];
    
    try {
      const categoriesRef = collection(db, 'users', user.uid, 'categories');
      const querySnapshot = await getDocs(categoriesRef);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TaskCategory));
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  };

  const saveCategories = async (categories: TaskCategory[]) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      for (const category of categories) {
        const categoryRef = doc(db, 'users', user.uid, 'categories', category.id);
        await setDoc(categoryRef, {
          name: category.name,
          color: category.color
        });
      }
    } catch (error) {
      console.error('Error saving categories:', error);
      throw error;
    }
  };

  const updateSettings = async (settings: Partial<UserSettings>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const settingsRef = doc(db, 'userSettings', user.uid);
      await updateDoc(settingsRef, settings);
      
      setUserSettings(prev => prev ? { ...prev, ...settings } : null);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

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
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          date: data.date ? (data.date as Timestamp).toDate() : new Date(),
          mealType: data.mealType || 'snack',
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

  const sendFriendRequest = async (recipientId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const requestRef = collection(db, 'friendRequests');
      
      await addDoc(requestRef, {
        senderId: user.uid,
        senderName: user.displayName,
        recipientId,
        status: 'pending',
        createdAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  };
  
  const acceptFriendRequest = async (requestId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const requestRef = doc(db, 'friendRequests', requestId);
      const requestDoc = await getDoc(requestRef);
      
      if (!requestDoc.exists()) throw new Error('Friend request not found');
      
      const requestData = requestDoc.data() as FriendRequest;
      
      await updateDoc(requestRef, { status: 'accepted' });
      
      const currentUserFriendRef = doc(db, 'users', user.uid, 'friends', requestData.senderId);
      const senderFriendRef = doc(db, 'users', requestData.senderId, 'friends', user.uid);
      
      const senderUserDoc = await getDoc(doc(db, 'userSettings', requestData.senderId));
      const senderUser = await getDoc(doc(db, 'users', requestData.senderId));
      
      await setDoc(currentUserFriendRef, {
        userId: requestData.senderId,
        displayName: requestData.senderName,
        addedAt: Timestamp.now()
      });
      
      await setDoc(senderFriendRef, {
        userId: user.uid,
        displayName: user.displayName,
        addedAt: Timestamp.now()
      });
      
      await addActivity(user.uid, {
        type: 'friend_added',
        userId: requestData.senderId,
        userName: requestData.senderName,
        timestamp: Timestamp.now()
      });
      
      await addActivity(requestData.senderId, {
        type: 'friend_added',
        userId: user.uid,
        userName: user.displayName || 'User',
        timestamp: Timestamp.now()
      });
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  };
  
  const rejectFriendRequest = async (requestId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const requestRef = doc(db, 'friendRequests', requestId);
      await updateDoc(requestRef, { status: 'rejected' });
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      throw error;
    }
  };
  
  const getFriendRequests = async () => {
    if (!user) return [];
    
    try {
      const requestsRef = collection(db, 'friendRequests');
      const q = query(
        requestsRef,
        where('recipientId', '==', user.uid),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp).toDate()
      } as FriendRequest));
    } catch (error) {
      console.error('Error getting friend requests:', error);
      return [];
    }
  };
  
  const getFriends = async () => {
    if (!user) return [];
    
    try {
      const friendsRef = collection(db, 'users', user.uid, 'friends');
      const querySnapshot = await getDocs(friendsRef);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        addedAt: (doc.data().addedAt as Timestamp).toDate()
      } as FriendData));
    } catch (error) {
      console.error('Error getting friends:', error);
      return [];
    }
  };
  
  const removeFriend = async (friendId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const currentUserFriendRef = doc(db, 'users', user.uid, 'friends', friendId);
      const friendUserRef = doc(db, 'users', friendId, 'friends', user.uid);
      
      await deleteDoc(currentUserFriendRef);
      await deleteDoc(friendUserRef);
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  };
  
  const addActivity = async (userId: string, activity: Omit<ActivityItem, 'id'>) => {
    try {
      const activitiesRef = collection(db, 'users', userId, 'activities');
      await addDoc(activitiesRef, activity);
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };
  
  const getFriendActivities = async () => {
    if (!user) return [];
    
    try {
      const friends = await getFriends();
      
      if (friends.length === 0) return [];
      
      const activities: ActivityItem[] = [];
      
      for (const friend of friends) {
        const settingsRef = doc(db, 'userSettings', friend.userId);
        const settingsDoc = await getDoc(settingsRef);
        
        if (!settingsDoc.exists()) continue;
        
        const settings = settingsDoc.data() as UserSettings;
        
        if (settings.publicProfile) {
          const activitiesRef = collection(db, 'users', friend.userId, 'activities');
          const q = query(
            activitiesRef,
            orderBy('timestamp', 'desc'),
            limit(10)
          );
          
          const querySnapshot = await getDocs(q);
          
          const friendActivities = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : data.timestamp,
              friendId: friend.userId,
              friendName: friend.displayName
            } as ActivityItem;
          });
          
          activities.push(...friendActivities);
        }
      }
      
      return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('Error getting friend activities:', error);
      return [];
    }
  };
  
  const getUserProfile = async (userId: string) => {
    try {
      const settingsRef = doc(db, 'userSettings', userId);
      const settingsDoc = await getDoc(settingsRef);
      
      if (!settingsDoc.exists()) return null;
      
      const settings = settingsDoc.data() as UserSettings;
      
      if (!settings.publicProfile && (!user || user.uid !== userId)) return null;
      
      const userDoc = await getDoc(doc(db, 'users', userId));
      let userData = {};
      
      if (userDoc.exists()) {
        userData = userDoc.data();
      }
      
      let fitnessData = null;
      if (settings.shareFitness || (user && user.uid === userId)) {
        const workoutsRef = collection(db, 'users', userId, 'workouts');
        const workoutsQuery = query(workoutsRef, orderBy('date', 'desc'), limit(5));
        const workoutsSnapshot = await getDocs(workoutsQuery);
        
        const workouts = workoutsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date instanceof Timestamp ? data.date.toDate() : data.date
          };
        });
        
        fitnessData = { workouts };
      }
      
      let progressData = null;
      if (settings.shareProgress || (user && user.uid === userId)) {
        const progressRef = collection(db, 'users', userId, 'progress');
        const progressQuery = query(progressRef, orderBy('date', 'desc'), limit(10));
        const progressSnapshot = await getDocs(progressQuery);
        
        const progress = progressSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date instanceof Timestamp ? data.date.toDate() : data.date
          };
        });
        
        progressData = { progress };
      }
      
      return {
        userId,
        displayName: userDoc.exists() ? userDoc.data().displayName : 'User',
        settings: {
          publicProfile: settings.publicProfile,
          shareProgress: settings.shareProgress,
          shareFitness: settings.shareFitness
        },
        userData,
        fitnessData,
        progressData
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  };
  
  const exportUserData = async (dataType: 'meals' | 'workouts' | 'progress', format: 'csv' | 'pdf') => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      let data: any[] = [];
      
      switch (dataType) {
        case 'meals':
          data = await getMeals();
          break;
        case 'workouts':
          data = await getWorkouts();
          break;
        case 'progress':
          data = await getProgressLogs();
          break;
      }
      
      if (format === 'csv') {
        return convertToCSV(data, dataType);
      } else {
        return JSON.stringify(data);
      }
    } catch (error) {
      console.error(`Error exporting ${dataType} data:`, error);
      throw error;
    }
  };
  
  const convertToCSV = (data: any[], type: string) => {
    if (data.length === 0) return '';
    
    let headers: string[] = [];
    let rows: string[][] = [];
    
    switch (type) {
      case 'meals':
        headers = ['Date', 'Meal Type', 'Foods', 'Calories', 'Notes'];
        rows = (data as MealLog[]).map(meal => [
          meal.date.toISOString().split('T')[0],
          meal.mealType,
          meal.foods.map(f => f.name).join('; '),
          meal.foods.reduce((sum, food) => sum + food.calories, 0).toString(),
          meal.notes || ''
        ]);
        break;
        
      case 'workouts':
        headers = ['Date', 'Type', 'Duration (min)', 'Exercises', 'Notes'];
        rows = (data as WorkoutSession[]).map(workout => [
          workout.date.toISOString().split('T')[0],
          workout.type,
          workout.duration.toString(),
          workout.exercises.map(e => e.name).join('; '),
          workout.notes || ''
        ]);
        break;
        
      case 'progress':
        headers = ['Date', 'Weight'];
        rows = (data as ProgressLog[]).map(log => [
          log.date.toISOString().split('T')[0],
          log.weight.toString()
        ]);
        break;
    }
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    return csvContent;
  };

  const value = {
    user,
    loading,
    userSettings,
    createAccount,
    signIn,
    logOut,
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    saveCategories,
    getCategories,
    updateSettings,
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
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriendRequests,
    getFriends,
    removeFriend,
    getFriendActivities,
    getUserProfile,
    exportUserData
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
