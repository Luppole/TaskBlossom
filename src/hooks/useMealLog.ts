
import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/contexts/SupabaseContext';
import { MealLog } from '@/types/task';

export const useMealLog = (date: Date) => {
  const { getMeals } = useSupabase();
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [lastLoadedDate, setLastLoadedDate] = useState<string | null>(null);

  // Create a date string to compare and avoid unnecessary reloading
  const dateString = date.toISOString().split('T')[0];

  const fetchMeals = useCallback(async (force: boolean = false) => {
    // Skip if already loaded for this date and not forced
    if (hasLoaded && dateString === lastLoadedDate && !force) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Log once per fetch, not continuously
      console.log(`Loading meals for date: ${date.toISOString()}`);
      
      const data = await getMeals(date);
      
      // Log once after fetch completes
      console.log(`Loaded ${data.length} meals for date ${dateString}`);
      
      setMeals(data);
      setHasLoaded(true);
      setLastLoadedDate(dateString);
    } catch (err) {
      setError('Failed to load meals');
      console.error('Error loading meals:', err);
    } finally {
      setIsLoading(false);
    }
  }, [date, getMeals, dateString, hasLoaded, lastLoadedDate]);

  // Only fetch when the date changes or component first mounts
  useEffect(() => {
    if (dateString !== lastLoadedDate || !hasLoaded) {
      fetchMeals();
    }
  }, [fetchMeals, dateString, lastLoadedDate, hasLoaded]);

  // Function to manually refresh meals
  const refreshMeals = useCallback(() => {
    return fetchMeals(true);
  }, [fetchMeals]);

  return { 
    meals, 
    isLoading, 
    error,
    refreshMeals,
    hasLoaded
  };
};
