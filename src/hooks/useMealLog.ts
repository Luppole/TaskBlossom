
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSupabase } from '@/contexts/SupabaseContext';
import { MealLog } from '@/types/task';

export const useMealLog = (date: Date) => {
  const { getMeals } = useSupabase();
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  
  // Create a date string to compare and avoid unnecessary reloading
  const dateString = date.toISOString().split('T')[0];
  const previousDateRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);
  const loadAttempts = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchMeals = useCallback(async (force: boolean = false) => {
    // Skip if already fetching or if already loaded for this date and not forced
    if (isFetchingRef.current || (hasLoaded && dateString === previousDateRef.current && !force)) {
      return;
    }
    
    // Limit load attempts to prevent excessive API calls
    if (loadAttempts.current > 3 && !force) {
      console.log('Too many load attempts, skipping automatic load');
      return;
    }
    
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);
      
      // Only log once to avoid console spam
      if (loadAttempts.current === 0 || force) {
        console.log(`Loading meals for date: ${date.toISOString()}`);
      }
      
      const data = await getMeals(date);
      setMeals(data);
      setHasLoaded(true);
      previousDateRef.current = dateString;
      loadAttempts.current += 1;
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError('Failed to load meals');
        console.error('Error loading meals:', err);
      }
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [date, getMeals, dateString, hasLoaded]);

  useEffect(() => {
    // Only fetch when the date changes or component first mounts
    if (dateString !== previousDateRef.current || !hasLoaded) {
      fetchMeals();
    }
    
    // Reset load attempts on date change
    if (dateString !== previousDateRef.current) {
      loadAttempts.current = 0;
    }
    
    // Clean up function to abort any pending requests when the component unmounts or dependencies change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchMeals, dateString]);

  // Function to manually refresh meals
  const refreshMeals = useCallback(() => {
    loadAttempts.current = 0; // Reset load attempts on manual refresh
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
