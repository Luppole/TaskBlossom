
import { useState, useEffect } from 'react';
import { useSupabase } from '@/contexts/SupabaseContext';
import { MealLog } from '@/types/task';

export const useMealLog = (date: Date) => {
  const { getMeals } = useSupabase();
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getMeals(date);
        setMeals(data);
      } catch (err) {
        setError('Failed to load meals');
        console.error('Error loading meals:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeals();
  }, [date, getMeals]);

  return { meals, isLoading, error };
};
