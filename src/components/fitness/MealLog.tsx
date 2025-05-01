
import React, { useState } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabase } from '@/contexts/SupabaseContext';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { useMealLog } from '@/hooks/useMealLog';
import { MealLog as MealLogType } from '@/types/task';
import MealCard, { MealType } from './meal/MealCard';
import MealStats from './meal/MealStats';

const MealLog = () => {
  const { user, createMeal, updateMeal } = useSupabase();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const today = new Date();
  
  // Use the improved hook
  const { meals, isLoading, error, refreshMeals } = useMealLog(today);
  
  const [newFoods, setNewFoods] = useState<Record<string, {id: string, name: string, calories: number}>>({
    breakfast: { id: uuidv4(), name: '', calories: 0 },
    lunch: { id: uuidv4(), name: '', calories: 0 },
    dinner: { id: uuidv4(), name: '', calories: 0 },
    snack: { id: uuidv4(), name: '', calories: 0 },
  });
  
  const mealDescriptions = {
    breakfast: "Morning meal to start your day",
    lunch: "Midday meal to keep you going",
    dinner: "Evening meal to finish your day",
    snack: "Small bites between meals"
  };
  
  const getMealByType = (type: MealType) => {
    return meals.find(meal => meal.mealType === type) || {
      id: '',
      date: today,
      mealType: type,
      foods: [],
      notes: null,
    };
  };
  
  const handleAddFood = async (mealType: MealType) => {
    const food = {
      id: newFoods[mealType].id,
      name: newFoods[mealType].name,
      quantity: 1,
      unit: 'serving',
      calories: newFoods[mealType].calories
    };
    
    if (!food.name.trim() || food.calories <= 0) {
      toast.error('Please fill in both name and calories');
      return;
    }
    
    try {
      const existingMeal = meals.find(meal => meal.mealType === mealType);
      
      if (existingMeal) {
        const updatedFoods = [...existingMeal.foods, food];
        await updateMeal(existingMeal.id, { foods: updatedFoods });
        toast.success('Food added!', {
          description: `Added ${food.name} to ${mealType}`,
          duration: 2000,
        });
      } else {
        const newMeal = {
          date: today,
          mealType: mealType,
          foods: [food],
          notes: null,
        };
        
        await createMeal(newMeal);
        toast.success('Meal created!', {
          description: `Started logging ${mealType} with ${food.name}`,
          duration: 2000,
        });
      }
      
      setNewFoods({
        ...newFoods,
        [mealType]: { id: uuidv4(), name: '', calories: 0 }
      });
      
      refreshMeals();
      
    } catch (error) {
      console.error('Error adding food:', error);
      toast.error('Something went wrong');
    }
  };
  
  const handleRemoveFood = async (mealType: MealType, foodId: string) => {
    try {
      const meal = meals.find(m => m.mealType === mealType);
      if (!meal) return;
      
      const foodToRemove = meal.foods.find(f => f.id === foodId);
      const updatedFoods = meal.foods.filter(food => food.id !== foodId);
      
      await updateMeal(meal.id, { foods: updatedFoods });
      toast.success(`Removed ${foodToRemove?.name || 'food'}`);
      
      refreshMeals();
      
    } catch (error) {
      console.error('Error removing food:', error);
      toast.error('Something went wrong');
    }
  };
  
  const handleFoodChange = (
    mealType: MealType,
    field: 'name' | 'calories',
    value: string | number
  ) => {
    setNewFoods({
      ...newFoods,
      [mealType]: {
        ...newFoods[mealType],
        [field]: field === 'calories' ? Number(value) : value
      }
    });
  };
  
  const getTotalMealCalories = (mealType: MealType) => {
    const meal = getMealByType(mealType);
    if (!meal.foods.length) return 0;
    
    return meal.foods.reduce((total, food) => total + food.calories, 0);
  };
  
  const getTotalCalories = () => {
    return meals.reduce((total, meal) => {
      const mealCalories = meal.foods.reduce((mealTotal, food) => mealTotal + food.calories, 0);
      return total + mealCalories;
    }, 0);
  };

  // Create meal breakdown
  const mealBreakdown = {
    breakfast: getTotalMealCalories('breakfast'),
    lunch: getTotalMealCalories('lunch'),
    dinner: getTotalMealCalories('dinner'),
    snack: getTotalMealCalories('snack'),
  };

  if (error && !user) {
    return (
      <div className="space-y-6">
        <MealStats 
          today={today}
          totalCalories={getTotalCalories()}
          mealBreakdown={mealBreakdown}
          isRTL={isRTL}
        />
        
        <Alert variant="destructive" className="my-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <motion.div 
      className={`space-y-6 ${isRTL ? 'text-right' : 'text-left'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Stats section with today's date and total calories */}
      <MealStats 
        today={today}
        totalCalories={getTotalCalories()}
        mealBreakdown={mealBreakdown}
        isRTL={isRTL}
      />
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Meal cards grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((mealType, index) => (
          <motion.div
            key={mealType}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.01 }}
            className="transition-all"
          >
            <MealCard
              type={mealType}
              meal={getMealByType(mealType)}
              totalCalories={getTotalMealCalories(mealType)}
              isLoading={isLoading}
              newFood={newFoods[mealType]}
              isRTL={isRTL}
              mealDescription={mealDescriptions[mealType]}
              onFoodChange={(field, value) => handleFoodChange(mealType, field, value)}
              onAddFood={() => handleAddFood(mealType)}
              onRemoveFood={(foodId) => handleRemoveFood(mealType, foodId)}
            />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default MealLog;
