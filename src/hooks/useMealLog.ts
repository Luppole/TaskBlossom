
import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/contexts/SupabaseContext';
import { MealLog } from '@/types/task';

export const useMealLog = (date: Date) => {
  const { getMeals } = useSupabase();
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeals = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log(`Loading meals for date: ${date.toISOString()}`);
      const data = await getMeals(date);
      console.log(`Loaded ${data.length} meals for today`);
      setMeals(data);
    } catch (err) {
      setError('Failed to load meals');
      console.error('Error loading meals:', err);
    } finally {
      setIsLoading(false);
    }
  }, [date, getMeals]);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  return { 
    meals, 
    isLoading, 
    error,
    refreshMeals: fetchMeals 
  };
};
