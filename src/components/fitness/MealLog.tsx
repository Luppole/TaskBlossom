
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MealLog as MealLogType, FoodItem } from '@/types/task';
import { format } from 'date-fns';
import { Plus, Coffee, Apple, Pizza, Utensils, Trash2, PlusCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirebase } from '@/contexts/FirebaseContext';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { v4 as uuidv4 } from 'uuid';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

const MealLog = () => {
  const { user, getMeals, createMeal, updateMeal } = useFirebase();
  const [meals, setMeals] = useState<MealLogType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const today = new Date();
  
  const [newFoods, setNewFoods] = useState<Record<string, FoodItem>>({
    breakfast: { id: uuidv4(), name: '', quantity: 1, unit: 'serving', calories: 0 },
    lunch: { id: uuidv4(), name: '', quantity: 1, unit: 'serving', calories: 0 },
    dinner: { id: uuidv4(), name: '', quantity: 1, unit: 'serving', calories: 0 },
    snack: { id: uuidv4(), name: '', quantity: 1, unit: 'serving', calories: 0 },
  });
  
  // Load meals from Firebase
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
          setError('Failed to load meals. Please check your Firebase permissions.');
          toast.error('Failed to load meals');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
        setError('Please log in to access your meal log');
      }
    };

    loadMeals();
  }, [user, getMeals, today]);
  
  const mealTypeIcons = {
    breakfast: <Coffee className="h-5 w-5" />,
    lunch: <Utensils className="h-5 w-5" />,
    dinner: <Pizza className="h-5 w-5" />,
    snack: <Apple className="h-5 w-5" />,
  };
  
  const mealTypeNames = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snacks',
  };
  
  const mealTypeColors = {
    breakfast: 'bg-blue-100 text-blue-600 border-blue-200',
    lunch: 'bg-amber-100 text-amber-600 border-amber-200',
    dinner: 'bg-purple-100 text-purple-600 border-purple-200',
    snack: 'bg-green-100 text-green-600 border-green-200',
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
    const food = newFoods[mealType];
    
    if (!food.name.trim() || food.calories <= 0) {
      toast.error('Please enter a food name and calories');
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
          mealType,
          foods: [food],
          notes: null,
        };
        
        const savedMeal = await createMeal(newMeal);
        setMeals([...meals, savedMeal]);
      }
      
      // Reset input
      setNewFoods({
        ...newFoods,
        [mealType]: { id: uuidv4(), name: '', quantity: 1, unit: 'serving', calories: 0 }
      });
      
      toast.success('Food added');
    } catch (error) {
      console.error('Error adding food:', error);
      toast.error('Failed to add food');
    }
  };
  
  const handleRemoveFood = async (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack', foodId: string) => {
    try {
      const meal = meals.find(m => m.mealType === mealType);
      if (!meal) return;
      
      const updatedFoods = meal.foods.filter(food => food.id !== foodId);
      
      if (updatedFoods.length > 0) {
        // Update meal with remaining foods
        await updateMeal(meal.id, { foods: updatedFoods });
        
        // Update local state
        setMeals(meals.map(m => 
          m.id === meal.id 
            ? { ...m, foods: updatedFoods }
            : m
        ));
      } else {
        // If no foods left, we could delete the meal entirely
        // But for now, let's just update with empty foods array
        await updateMeal(meal.id, { foods: [] });
        
        // Update local state
        setMeals(meals.map(m => 
          m.id === meal.id 
            ? { ...m, foods: [] }
            : m
        ));
      }
      
      toast.success('Food removed');
    } catch (error) {
      console.error('Error removing food:', error);
      toast.error('Failed to remove food');
    }
  };
  
  const handleFoodChange = (
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    field: keyof FoodItem,
    value: string | number
  ) => {
    setNewFoods({
      ...newFoods,
      [mealType]: {
        ...newFoods[mealType],
        [field]: field === 'calories' || field === 'quantity' ? Number(value) : value
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
    const colorClass = mealTypeColors[type];
    
    return (
      <Card className={`border-l-4 ${colorClass.split(' ').pop()} shadow-md hover:shadow-lg transition-shadow`}>
        <CardHeader className={`pb-2 ${colorClass}`}>
          <CardTitle className="text-lg flex items-center">
            {mealTypeIcons[type]}
            <span className="ml-2 font-semibold">{mealTypeNames[type]}</span>
            {totalCalories > 0 && (
              <span className="ml-auto text-sm font-medium px-2 py-1 bg-white bg-opacity-50 rounded-full">
                {totalCalories} kcal
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-5 w-3/4" />
            </div>
          ) : meal.foods.length > 0 ? (
            <div className="space-y-2">
              <AnimatePresence>
                {meal.foods.map(food => (
                  <motion.div 
                    key={food.id} 
                    className="flex justify-between items-center text-sm p-2 border-b last:border-b-0"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div>
                      <span className="font-medium">{food.name}</span>
                      <span className="text-muted-foreground ml-2">
                        ({food.quantity} {food.unit})
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2 text-muted-foreground">{food.calories} kcal</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFood(type, food.id)}
                        className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-muted-foreground text-sm text-center py-4 border border-dashed rounded-lg">
              <p className="mb-1">No foods logged for {mealTypeNames[type].toLowerCase()}</p>
              <PlusCircle className="h-4 w-4 mx-auto text-muted-foreground/50" />
            </div>
          )}
          
          <div className="mt-4 space-y-3">
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <Label htmlFor={`${type}-food`} className="text-xs font-medium">Food Name</Label>
                <Input
                  id={`${type}-food`}
                  value={newFoods[type].name}
                  onChange={(e) => handleFoodChange(type, 'name', e.target.value)}
                  placeholder={`Add ${mealTypeNames[type].toLowerCase()} item`}
                  className="h-8"
                />
              </div>
              <div className="w-16">
                <Label htmlFor={`${type}-qty`} className="text-xs font-medium">Qty</Label>
                <Input
                  id={`${type}-qty`}
                  type="number"
                  min="0.25"
                  step="0.25"
                  value={newFoods[type].quantity}
                  onChange={(e) => handleFoodChange(type, 'quantity', e.target.value)}
                  className="h-8"
                />
              </div>
              <div className="w-24">
                <Label htmlFor={`${type}-calories`} className="text-xs font-medium">Calories</Label>
                <Input
                  id={`${type}-calories`}
                  type="number"
                  min="0"
                  value={newFoods[type].calories}
                  onChange={(e) => handleFoodChange(type, 'calories', e.target.value)}
                  className="h-8"
                />
              </div>
              <Button
                size="sm"
                onClick={() => handleAddFood(type)}
                className="mb-[2px]"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
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
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Today's Food Log</h2>
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Today's Food Log</h2>
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground">
            {format(today, 'PPP')}
          </p>
          <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            {getTotalCalories()} kcal today
          </span>
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
      
      {user && (
        <div className="text-xs text-center text-muted-foreground mt-8">
          <p>To enable browser notifications for meal reminders, please allow notifications when prompted.</p>
        </div>
      )}
    </div>
  );
};

export default MealLog;
