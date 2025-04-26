
import { supabase } from '@/integrations/supabase/client';
import { TaskCategory } from '@/types/task';
import { useSupabase } from '@/contexts/SupabaseContext';
import { toast } from 'sonner';

export const useCategoryOperations = () => {
  const { user, getCategories, saveCategories } = useSupabase();

  return {
    getCategories,
    saveCategories,
  };
};
