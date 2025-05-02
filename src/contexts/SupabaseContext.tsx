
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, createUserProfile } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { UserSettings, DEFAULT_USER_SETTINGS } from '@/types/settings';

interface SupabaseContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  getTasks: () => Promise<any[]>;
  createTask: (taskData: any) => Promise<any>;
  updateTask: (taskId: string, taskData: Partial<any>) => Promise<any>;
  deleteTask: (taskId: string) => Promise<void>;
  getCategories: () => Promise<any[]>;
  saveCategories: (categories: any[]) => Promise<void>;
  getWorkouts: () => Promise<any[]>;
  createWorkout: (workoutData: any) => Promise<any>;
  updateWorkout: (workoutId: string, workoutData: Partial<any>) => Promise<any>;
  deleteWorkout: (workoutId: string) => Promise<void>;
  getMeals: (date?: Date) => Promise<any[]>;
  createMeal: (mealData: any) => Promise<any>;
  updateMeal: (mealId: string, mealData: Partial<any>) => Promise<any>;
  deleteMeal: (mealId: string) => Promise<void>;
  getProgressLogs: () => Promise<any[]>;
  createProgressLog: (logData: any) => Promise<any>;
  getFitnessGoals: () => Promise<any | null>;
  updateFitnessGoals: (goals: any) => Promise<void>;
  getFriends: () => Promise<any[]>;
  getFriendRequests: () => Promise<any[]>;
  sendFriendRequest: (userId: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  searchUsersByName: (query: string) => Promise<any[]>;
  updateUserProfile: (profileData: any) => Promise<void>;
  getUserProfile: (userId?: string) => Promise<any>;
  updateUserSettings: (settings: Partial<UserSettings>) => Promise<void>;
}

export const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    // First set up auth state listener for all future state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log('Supabase auth event:', event);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Retrieved session:', currentSession ? 'Yes' : 'No');
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error: any) {
      console.error('Error signing in:', error.message);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: name,
            full_name: name
          }
        }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Error signing up:', error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error('Error signing out:', error.message);
      throw error;
    }
  };

  const getTasks = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      return data.map(task => ({
        ...task,
        id: task.id,
        dueDate: task.due_date ? new Date(task.due_date) : null,
        category: task.category_id ? { id: task.category_id } : null,
        completed: task.completed || false,
        priority: task.description?.includes('priority:') 
          ? task.description.match(/priority:(high|medium|low)/)?.[1] || 'medium'
          : 'medium',
        notes: task.description
      }));
    } catch (error) {
      console.error('Error getting tasks:', error);
      toast.error(t('common.error'));
      return [];
    }
  };

  const createTask = async (taskData: any) => {
    if (!user) throw new Error('User not authenticated');

    try {
      let category_id = null;
      if (taskData.category && taskData.category.id) {
        if (typeof taskData.category.id === 'string' && 
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(taskData.category.id)) {
          category_id = taskData.category.id;
        } else {
          console.warn('Invalid category ID format, setting to null', taskData.category.id);
        }
      }
      
      const taskToInsert = {
        title: taskData.title,
        description: taskData.notes,
        due_date: taskData.dueDate,
        category_id: category_id,
        completed: taskData.completed || false,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert(taskToInsert)
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        id: data.id,
        dueDate: data.due_date ? new Date(data.due_date) : null,
        category: category_id ? { id: category_id } : null,
        priority: taskData.priority || 'medium',
        notes: data.description
      };
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
      throw error;
    }
  };

  const updateTask = async (taskId: string, taskData: Partial<any>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const updateData: any = {};
      
      if (taskData.title !== undefined) updateData.title = taskData.title;
      if (taskData.notes !== undefined) updateData.description = taskData.notes;
      if (taskData.dueDate !== undefined) updateData.due_date = taskData.dueDate;
      if (taskData.completed !== undefined) {
        updateData.completed = taskData.completed;
        updateData.completed_at = taskData.completed ? new Date().toISOString() : null;
      }
      if (taskData.category !== undefined) updateData.category_id = taskData.category?.id || null;
      
      if (taskData.completedAt !== undefined) updateData.completed_at = taskData.completedAt;

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;

      return { id: taskId, ...taskData };
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
      throw error;
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      throw error;
    }
  };

  const getCategories = async () => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      return data.map(category => ({
        id: category.id,
        name: category.name,
        color: category.color
      }));
    } catch (error) {
      console.error('Error getting categories:', error);
      toast.error('Failed to load categories');
      return [];
    }
  };

  const saveCategories = async (categories: any[]) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Ensure categories have proper UUIDs
      for (const category of categories) {
        // Validate that the ID is a valid UUID format
        const validUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category.id);
        
        if (!validUuid) {
          console.warn(`Category ID ${category.id} is not a valid UUID, generating a new one`);
          const { data: newCategory } = await supabase
            .from('categories')
            .insert({
              name: category.name,
              color: category.color,
              user_id: user.id
            })
            .select()
            .single();
          
          if (newCategory) {
            category.id = newCategory.id;
          }
        } else {
          const { error } = await supabase
            .from('categories')
            .upsert({
              id: category.id,
              name: category.name,
              color: category.color,
              user_id: user.id
            });
            
          if (error) throw error;
        }
      }
    } catch (error) {
      console.error('Error saving categories:', error);
      toast.error('Failed to save categories');
      throw error;
    }
  };

  const getWorkouts = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      return data.map(workout => ({
        ...workout,
        date: new Date(workout.date),
        exercises: workout.exercises || []
      }));
    } catch (error) {
      console.error('Error getting workouts:', error);
      toast.error('Failed to load workouts');
      return [];
    }
  };

  const createWorkout = async (workoutData: any) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const workoutToInsert = {
        ...workoutData,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('workouts')
        .insert(workoutToInsert)
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        date: new Date(data.date)
      };
    } catch (error) {
      console.error('Error creating workout:', error);
      toast.error('Failed to create workout');
      throw error;
    }
  };

  const updateWorkout = async (workoutId: string, workoutData: Partial<any>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('workouts')
        .update(workoutData)
        .eq('id', workoutId)
        .eq('user_id', user.id);

      if (error) throw error;

      return { id: workoutId, ...workoutData };
    } catch (error) {
      console.error('Error updating workout:', error);
      toast.error('Failed to update workout');
      throw error;
    }
  };

  const deleteWorkout = async (workoutId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast.error('Failed to delete workout');
      throw error;
    }
  };

  const getMeals = async (date?: Date) => {
    if (!user) return [];

    try {
      let query = supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id);

      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        console.log(`Fetching meals between ${startOfDay.toISOString()} and ${endOfDay.toISOString()}`);
        
        query = query
          .gte('date', startOfDay.toISOString())
          .lte('date', endOfDay.toISOString());
      }

      const { data, error } = await query.order('date', { ascending: true });

      if (error) throw error;

      return data.map(meal => ({
        ...meal,
        date: new Date(meal.date),
        foods: meal.foods || [],
        mealType: meal.meal_type
      }));
    } catch (error) {
      console.error('Error getting meals:', error);
      toast.error(t('common.error'));
      return [];
    }
  };

  const createMeal = async (mealData: any) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const mealToInsert = {
        date: mealData.date.toISOString(),
        foods: mealData.foods || [],
        notes: mealData.notes || null,
        meal_type: mealData.mealType,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('meals')
        .insert(mealToInsert)
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        date: new Date(data.date),
        mealType: data.meal_type,
        foods: data.foods || []
      };
    } catch (error) {
      console.error('Error creating meal:', error);
      toast.error(t('common.error'));
      throw error;
    }
  };

  const updateMeal = async (mealId: string, mealData: Partial<any>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const dataToUpdate: any = { ...mealData };
      
      if (dataToUpdate.mealType !== undefined) {
        dataToUpdate.meal_type = dataToUpdate.mealType;
        delete dataToUpdate.mealType;
      }

      const { error } = await supabase
        .from('meals')
        .update(dataToUpdate)
        .eq('id', mealId)
        .eq('user_id', user.id);

      if (error) throw error;

      return { 
        id: mealId,
        ...mealData
      };
    } catch (error) {
      console.error('Error updating meal:', error);
      toast.error('Failed to update meal');
      throw error;
    }
  };

  const deleteMeal = async (mealId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting meal:', error);
      toast.error('Failed to delete meal');
      throw error;
    }
  };

  const getProgressLogs = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('progress_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      return data.map(log => ({
        ...log,
        date: new Date(log.date)
      }));
    } catch (error) {
      console.error('Error getting progress logs:', error);
      toast.error('Failed to load progress logs');
      return [];
    }
  };

  const createProgressLog = async (logData: any) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const logToInsert = {
        ...logData,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('progress_logs')
        .insert(logToInsert)
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        date: new Date(data.date)
      };
    } catch (error) {
      console.error('Error creating progress log:', error);
      toast.error('Failed to create progress log');
      throw error;
    }
  };

  const getFitnessGoals = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('fitness_goals')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error getting fitness goals:', error);
      toast.error('Failed to load fitness goals');
      return null;
    }
  };

  const updateFitnessGoals = async (goals: any) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const goalsToUpsert = {
        ...goals,
        user_id: user.id
      };

      const { error } = await supabase
        .from('fitness_goals')
        .upsert(goalsToUpsert);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating fitness goals:', error);
      toast.error('Failed to update fitness goals');
      throw error;
    }
  };

  const getFriends = async () => {
    if (!user) return [];

    try {
      const { data: friendsData, error: friendsError } = await supabase
        .from('friends')
        .select(`
          id,
          friend_id,
          created_at
        `)
        .eq('user_id', user.id);

      if (friendsError) throw friendsError;

      const friends = [];
      for (const friend of friendsData || []) {
        // Get the friend's profile info
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', friend.friend_id)
          .single();
        
        friends.push({
          id: friend.id,
          userId: friend.friend_id,
          displayName: profileData?.full_name || profileData?.username || 'Friend',
          avatar_url: profileData?.avatar_url,
          addedAt: new Date(friend.created_at || new Date())
        });
      }

      return friends;
    } catch (error) {
      console.error('Error getting friends:', error);
      toast.error('Failed to load friends');
      return [];
    }
  };

  const getFriendRequests = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          id,
          sender_id,
          status,
          created_at
        `)
        .eq('recipient_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;

      const requests = [];
      for (const request of data || []) {
        // Get sender's profile
        const { data: senderProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', request.sender_id)
          .single();
        
        requests.push({
          id: request.id,
          senderId: request.sender_id,
          senderName: senderProfile?.full_name || senderProfile?.username || 'User',
          avatar_url: senderProfile?.avatar_url,
          createdAt: new Date(request.created_at || new Date())
        });
      }

      return requests;
    } catch (error) {
      console.error('Error getting friend requests:', error);
      toast.error('Failed to load friend requests');
      return [];
    }
  };

  const sendFriendRequest = async (userId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Check if request already exists
      const { data: existingRequest } = await supabase
        .from('friend_requests')
        .select('*')
        .match({ sender_id: user.id, recipient_id: userId, status: 'pending' })
        .maybeSingle();
      
      if (existingRequest) {
        toast.info('Friend request already sent');
        return;
      }
      
      // Check if they're already friends
      const { data: existingFriend } = await supabase
        .from('friends')
        .select('*')
        .match({ user_id: user.id, friend_id: userId })
        .maybeSingle();
      
      if (existingFriend) {
        toast.info('You are already friends with this user');
        return;
      }

      const { error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: user.id,
          recipient_id: userId,
          status: 'pending'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
      throw error;
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data: requestData, error: requestError } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('id', requestId)
        .eq('recipient_id', user.id)
        .single();

      if (requestError) throw requestError;

      // Create two-way friendship (user -> friend and friend -> user)
      const { error: friendError } = await supabase.from('friends').insert([
        { user_id: user.id, friend_id: requestData.sender_id },
        { user_id: requestData.sender_id, friend_id: user.id }
      ]);

      if (friendError) throw friendError;

      // Update request status
      const { error: updateError } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('Failed to accept friend request');
      throw error;
    }
  };

  const rejectFriendRequest = async (requestId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId)
        .eq('recipient_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast.error('Failed to reject friend request');
      throw error;
    }
  };

  const removeFriend = async (friendId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Remove both friendship records
      const { error } = await supabase
        .from('friends')
        .delete()
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Failed to remove friend');
      throw error;
    }
  };

  const searchUsersByName = async (query: string) => {
    if (!user) return [];
    
    try {
      let queryBuilder = supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id); // Don't include the current user
      
      if (query) {
        queryBuilder = queryBuilder.or(`username.ilike.%${query}%,full_name.ilike.%${query}%,email.ilike.%${query}%`);
      }
      
      const { data, error } = await queryBuilder.order('username', { ascending: true }).limit(20);
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
      return [];
    }
  };

  const getUserProfile = async (userId: string = user?.id || '') => {
    if (!userId) return null;
    
    try {
      console.log(`Fetching profile for user ID: ${userId}`);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        if (userId === user?.id) {
          console.log('Creating missing profile for current user');
          await createUserProfile(userId, user?.user_metadata || {});
          
          const { data: retryData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
            
          return retryData;
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  };

  const updateUserProfile = async (profileData: any) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profileData,
          updated_at: new Date().toISOString()
        });
    
      if (error) throw error;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const updateUserSettings = async (settings: Partial<UserSettings>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Get current profile
      const profile = await getUserProfile(user.id);
      
      // Create a base settings object, using defaults if no settings exist
      const currentSettings = profile?.settings 
        ? (typeof profile.settings === 'object' ? profile.settings as UserSettings : DEFAULT_USER_SETTINGS)
        : DEFAULT_USER_SETTINGS;
      
      // Update settings with new values
      const updatedSettings = {
        ...currentSettings,
        ...settings
      };
      
      // Save to profile
      await updateUserProfile({
        settings: updatedSettings
      });
      
    } catch (error) {
      console.error('Error updating user settings:', error);
      toast.error('Failed to update settings');
      throw error;
    }
  };

  return (
    <SupabaseContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      getTasks,
      createTask,
      updateTask,
      deleteTask,
      getCategories,
      saveCategories,
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
      getFriends,
      getFriendRequests,
      sendFriendRequest,
      acceptFriendRequest,
      rejectFriendRequest,
      removeFriend,
      searchUsersByName,
      updateUserProfile,
      getUserProfile,
      updateUserSettings
    }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};
