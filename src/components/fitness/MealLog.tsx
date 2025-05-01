
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { Plus, Coffee, Apple, Pizza, Utensils, Trash2, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabase } from '@/contexts/SupabaseContext';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { useMealLog } from '@/hooks/useMealLog';
import { MealLog as MealLogType } from '@/types/task';

// Extracted MealCard component to reduce complexity
const MealCard = ({ 
  type, 
  meal, 
  totalCalories, 
  isLoading, 
  newFood,
  isRTL,
  onFoodChange,
  onAddFood,
  onRemoveFood,
  mealDescription
}: { 
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  meal: MealLogType,
  totalCalories: number,
  isLoading: boolean,
  newFood: { id: string, name: string, calories: number },
  isRTL: boolean,
  mealDescription: string,
  onFoodChange: (field: 'name' | 'calories', value: string | number) => void,
  onAddFood: () => void,
  onRemoveFood: (foodId: string) => void
}) => {
  const { t } = useTranslation();
  
  const mealTypeIcons = {
    breakfast: <Coffee className="h-5 w-5" />,
    lunch: <Utensils className="h-5 w-5" />,
    dinner: <Pizza className="h-5 w-5" />,
    snack: <Apple className="h-5 w-5" />,
  };
  
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
        <CardDescription className="text-sm text-muted-foreground mt-1">
          {mealDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
          </div>
        ) : (
          <AnimatePresence>
            {meal.foods.length > 0 ? (
              <div className="space-y-2">
                {meal.foods.map(food => (
                  <motion.div 
                    key={food.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
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
                        onClick={() => onRemoveFood(food.id)}
                        className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground text-sm text-center py-4 border border-dashed rounded-lg">
                {t('fitness.noMealLogged', { mealType: t(`fitness.${type}`).toLowerCase() })}
              </div>
            )}
          </AnimatePresence>
        )}
        
        <div className="mt-4 space-y-3 p-3 rounded-lg border">
          <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} items-end space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
            <div className="flex-1">
              <Label htmlFor={`${type}-food`} className={`text-xs font-medium ${isRTL ? 'text-right block' : ''}`}>
                {t('fitness.foodName')}
              </Label>
              <Input
                id={`${type}-food`}
                value={newFood.name}
                onChange={(e) => onFoodChange('name', e.target.value)}
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
                value={newFood.calories}
                onChange={(e) => onFoodChange('calories', e.target.value)}
                className="h-8"
                dir="ltr"
              />
            </div>
            <Button
              size="sm"
              onClick={onAddFood}
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

// Main MealLog component
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
    breakfast: t('fitness.breakfastDesc', "Morning meal to start your day"),
    lunch: t('fitness.lunchDesc', "Midday meal to keep you going"),
    dinner: t('fitness.dinnerDesc', "Evening meal to finish your day"),
    snack: t('fitness.snackDesc', "Small bites between meals")
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
      toast.error(t('common.validationError'));
      return;
    }
    
    try {
      const existingMeal = meals.find(meal => meal.mealType === mealType);
      
      if (existingMeal) {
        const updatedFoods = [...existingMeal.foods, food];
        await updateMeal(existingMeal.id, { foods: updatedFoods });
        toast.success(t('common.save'));
      } else {
        const newMeal = {
          date: today,
          mealType: mealType,
          foods: [food],
          notes: null,
        };
        
        await createMeal(newMeal);
        toast.success(t('common.save'));
      }
      
      setNewFoods({
        ...newFoods,
        [mealType]: { id: uuidv4(), name: '', calories: 0 }
      });
      
      refreshMeals();
      
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
      toast.success(t('common.delete'));
      
      refreshMeals();
      
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
        {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((mealType, index) => (
          <motion.div
            key={mealType}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
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
    </div>
  );
};

export default MealLog;
