
import { supabase } from '@/integrations/supabase/client';
import { TaskCategory } from '@/types/task';
import { useFirebaseUser } from '../firebase/useFirebaseUser';
import { toast } from 'sonner';

export const useCategoryOperations = () => {
  const { user } = useFirebaseUser();

  const getCategories = async () => {
    if (!user) return [];
    
    try {
      console.log("Fetching categories for user:", user.uid);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.uid);
      
      if (error) {
        throw error;
      }
      
      console.log("Categories fetch completed, count:", data.length);
      
      // Transform Supabase data to match app's TaskCategory type
      return data.map(category => ({
        id: category.id,
        name: category.name,
        color: category.color
      } as TaskCategory));
    } catch (error) {
      console.error('Error getting categories:', error);
      toast.error('Failed to load categories');
      return [];
    }
  };

  const saveCategories = async (categories: TaskCategory[]) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // For each category, upsert to Supabase
      for (const category of categories) {
        const { error } = await supabase
          .from('categories')
          .upsert({
            id: category.id,
            name: category.name,
            color: category.color,
            user_id: user.uid
          });
          
        if (error) throw error;
      }
      
      console.log(`Saved ${categories.length} categories successfully`);
    } catch (error) {
      console.error('Error saving categories:', error);
      toast.error('Failed to save categories');
      throw error;
    }
  };

  return {
    getCategories,
    saveCategories,
  };
};
