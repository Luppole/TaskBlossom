
import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/contexts/SupabaseContext';
import { MealLog } from '@/types/task';

export const useMealLog = (date: Date) => {
  const { getMeals } = useSupabase();
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Add a state to track if initial fetch has completed
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchMeals = useCallback(async () => {
    // If already loaded, don't fetch again unless explicitly called with refreshMeals
    if (hasLoaded && isLoading === false) return;
    
    try {
      setIsLoading(true);
      setError(null);
      console.log(`Loading meals for date: ${date.toISOString()}`);
      const data = await getMeals(date);
      console.log(`Loaded ${data.length} meals for today`);
      setMeals(data);
      setHasLoaded(true);
    } catch (err) {
      setError('Failed to load meals');
      console.error('Error loading meals:', err);
    } finally {
      setIsLoading(false);
    }
  }, [date, getMeals, hasLoaded, isLoading]);

  useEffect(() => {
    // Only fetch on initial load or date change
    setHasLoaded(false);
    fetchMeals();
  }, [date]);

  return { 
    meals, 
    isLoading, 
    error,
    refreshMeals: fetchMeals 
  };
};
