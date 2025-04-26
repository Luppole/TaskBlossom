import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MealLog as MealLogType } from '@/types/task';
import { format } from 'date-fns';
import { 
  Plus, Coffee, Apple, Pizza, Utensils, Trash2, 
  Clock, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSupabase } from '@/contexts/SupabaseContext';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { v4 as uuidv4 } from 'uuid';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from 'react-i18next';

const MealLog = () => {
  const { user, getMeals, createMeal, updateMeal } = useSupabase();
  const [meals, setMeals] = useState<MealLogType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const today = new Date();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  
  const [newFoods, setNewFoods] = useState<Record<string, {id: string, name: string, calories: number}>>({
    breakfast: { id: uuidv4(), name: '', calories: 0 },
    lunch: { id: uuidv4(), name: '', calories: 0 },
    dinner: { id: uuidv4(), name: '', calories: 0 },
    snack: { id: uuidv4(), name: '', calories: 0 },
  });
  
  // Load meals from Supabase
  useEffect(() => {
    const loadMeals = async () => {
      if (user) {
        setIsLoading(true);
        setError(null);
        try {
          const todayMeals = await getMeals(today);
          setMeals(todayMeals);
        } catch (error) {
          console.error('Error loading meals:', error);
          setError('Failed to load meals');
          toast.error(t('common.error'));
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
        setError('Please log in to access your meal log');
      }
    };

    loadMeals();
  }, [user, getMeals, today, t]);
  
  const mealTypeIcons = {
    breakfast: <Coffee className="h-5 w-5" />,
    lunch: <Utensils className="h-5 w-5" />,
    dinner: <Pizza className="h-5 w-5" />,
    snack: <Apple className="h-5 w-5" />,
  };
  
  const getMealByType = (type: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    return meals.find(meal => meal.mealType === type) || {
      id: '',
      date: today,
      mealType: type,
      foods: [],
      notes: null,
    };
  };
  
  const handleAddFood = async (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    const food = {
      id: newFoods[mealType].id,
      name: newFoods[mealType].name,
      quantity: 1,
      unit: 'serving',
      calories: newFoods[mealType].calories
    };
    
    if (!food.name.trim() || food.calories <= 0) {
      toast.error(t('common.error'));
      return;
    }
    
    try {
      const existingMeal = meals.find(meal => meal.mealType === mealType);
      
      if (existingMeal) {
        // Add to existing meal
        const updatedFoods = [...existingMeal.foods, food];
        await updateMeal(existingMeal.id, { foods: updatedFoods });
        
        // Update local state
        setMeals(meals.map(meal => 
          meal.id === existingMeal.id 
            ? { ...meal, foods: updatedFoods }
            : meal
        ));
      } else {
        // Create new meal
        const newMeal: Omit<MealLogType, 'id'> = {
          date: today,
          mealType: mealType,
          foods: [food],
          notes: null,
        };
        
        const savedMeal = await createMeal(newMeal);
        setMeals([...meals, savedMeal]);
      }
      
      // Reset input
      setNewFoods({
        ...newFoods,
        [mealType]: { id: uuidv4(), name: '', calories: 0 }
      });
      
      toast.success(t('common.save'));
    } catch (error) {
      console.error('Error adding food:', error);
      toast.error(t('common.error'));
    }
  };
  
  const handleRemoveFood = async (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack', foodId: string) => {
    try {
      const meal = meals.find(m => m.mealType === mealType);
      if (!meal) return;
      
      const updatedFoods = meal.foods.filter(food => food.id !== foodId);
      
      await updateMeal(meal.id, { foods: updatedFoods });
      
      // Update local state
      setMeals(meals.map(m => 
        m.id === meal.id 
          ? { ...m, foods: updatedFoods }
          : m
      ));
      
      toast.success(t('common.delete'));
    } catch (error) {
      console.error('Error removing food:', error);
      toast.error(t('common.error'));
    }
  };
  
  const handleFoodChange = (
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
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
  
  const getTotalMealCalories = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
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
  
  const renderMealCard = (type: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    const meal = getMealByType(type);
    const totalCalories = getTotalMealCalories(type);
    
    return (
      <Card className={`border shadow-sm hover:shadow-md transition-all ${isRTL ? 'rtl' : ''}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              {mealTypeIcons[type]}
            </div>
            <span className={`${isRTL ? 'mr-2' : 'ml-2'} font-semibold`}>
              {t(`fitness.${type}`)}
            </span>
            {totalCalories > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {t('fitness.caloriesCount', { count: totalCalories })}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-4/5" />
            </div>
          ) : meal.foods.length > 0 ? (
            <div className="space-y-2">
              {meal.foods.map(food => (
                <div 
                  key={food.id} 
                  className={`flex justify-between items-center text-sm p-3 bg-background rounded-lg border ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
                >
                  <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={isRTL ? 'ml-2' : 'mr-2'}>
                      {mealTypeIcons[type]}
                    </div>
                    <div>
                      <span className="font-medium">{food.name}</span>
                      <div className={`text-xs text-muted-foreground flex items-center mt-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Clock className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                        {format(new Date(), 'h:mm a')}
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className={`${isRTL ? 'ml-2' : 'mr-2'} font-semibold`}>
                      {t('fitness.caloriesCount', { count: food.calories })}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFood(type, food.id)}
                      className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground text-sm text-center py-4 border border-dashed rounded-lg">
              {t('fitness.noFoods', { mealType: t(`fitness.${type}`).toLowerCase() })}
            </div>
          )}
          
          <div className="mt-4 space-y-3 p-3 rounded-lg border">
            <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} items-end space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
              <div className="flex-1">
                <Label htmlFor={`${type}-food`} className={`text-xs font-medium ${isRTL ? 'text-right block' : ''}`}>
                  {t('fitness.foodName')}
                </Label>
                <Input
                  id={`${type}-food`}
                  value={newFoods[type].name}
                  onChange={(e) => handleFoodChange(type, 'name', e.target.value)}
                  placeholder={t('fitness.addFood')}
                  className="h-8"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
              <div className="w-24">
                <Label htmlFor={`${type}-calories`} className={`text-xs font-medium ${isRTL ? 'text-right block' : ''}`}>
                  {t('fitness.calories')}
                </Label>
                <Input
                  id={`${type}-calories`}
                  type="number"
                  min="0"
                  value={newFoods[type].calories}
                  onChange={(e) => handleFoodChange(type, 'calories', e.target.value)}
                  className="h-8"
                  dir="ltr"
                />
              </div>
              <Button
                size="sm"
                onClick={() => handleAddFood(type)}
                className="mb-[2px]"
              >
                <Plus className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                {t('common.add')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (error && !user) {
    return (
      <div className="space-y-6">
        <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h2 className="text-xl font-semibold">{t('fitness.todayFoodLog')}</h2>
          <p className="text-muted-foreground">
            {format(today, 'PPP')}
          </p>
        </div>
        
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
    <div className={`space-y-6 ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
          {t('fitness.todayFoodLog')}
        </h2>
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Clock className="h-4 w-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            {format(today, 'PPP')}
          </p>
          {getTotalCalories() > 0 && (
            <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary font-medium">
              {t('fitness.totalCalories', { count: getTotalCalories() })}
            </Badge>
          )}
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderMealCard('breakfast')}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {renderMealCard('lunch')}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {renderMealCard('dinner')}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          {renderMealCard('snack')}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MealLog;
