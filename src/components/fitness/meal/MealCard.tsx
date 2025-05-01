
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from "@/components/ui/skeleton";
import { Coffee, Apple, Pizza, Utensils, Trash2, Clock, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { MealLog } from '@/types/task';
import { motion, AnimatePresence } from 'framer-motion';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface MealCardProps { 
  type: MealType;
  meal: MealLog;
  totalCalories: number;
  isLoading: boolean;
  newFood: { id: string, name: string, calories: number };
  isRTL: boolean;
  mealDescription: string;
  onFoodChange: (field: 'name' | 'calories', value: string | number) => void;
  onAddFood: () => void;
  onRemoveFood: (foodId: string) => void;
}

const MealCard: React.FC<MealCardProps> = ({ 
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
}) => {
  
  const mealTypeIcons = {
    breakfast: <Coffee className="h-5 w-5" />,
    lunch: <Utensils className="h-5 w-5" />,
    dinner: <Pizza className="h-5 w-5" />,
    snack: <Apple className="h-5 w-5" />,
  };

  const mealTypeLabels = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snacks',
  };
  
  return (
    <Card className={`border shadow-sm hover:shadow-md transition-all ${isRTL ? 'rtl' : ''} card-hover`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <motion.div 
            className="p-2 rounded-full bg-primary/10 text-primary"
            whileHover={{ scale: 1.1, rotate: 10 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {mealTypeIcons[type]}
          </motion.div>
          <span className={`${isRTL ? 'mr-2' : 'ml-2'} font-semibold`}>
            {mealTypeLabels[type]}
          </span>
          {totalCalories > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {totalCalories} kcal
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
                    className={`flex justify-between items-center text-sm p-3 bg-background rounded-lg border group hover:border-primary/20 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
                    whileHover={{ scale: 1.01, x: isRTL ? -3 : 3 }}
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
                        {food.calories} kcal
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveFood(food.id)}
                        className="h-7 w-7 rounded-full text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                className="text-muted-foreground text-sm text-center py-4 border border-dashed rounded-lg hover:border-primary/20 transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                No foods logged for {mealTypeLabels[type].toLowerCase()}
              </motion.div>
            )}
          </AnimatePresence>
        )}
        
        <div className="mt-4 space-y-3 p-3 rounded-lg border">
          <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} items-end space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
            <div className="flex-1">
              <Label htmlFor={`${type}-food`} className={`text-xs font-medium ${isRTL ? 'text-right block' : ''}`}>
                Food Name
              </Label>
              <Input
                id={`${type}-food`}
                value={newFood.name}
                onChange={(e) => onFoodChange('name', e.target.value)}
                placeholder="Add Food"
                className="h-8 transition-all focus:ring-2 focus:ring-primary/20"
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
            <div className="w-24">
              <Label htmlFor={`${type}-calories`} className={`text-xs font-medium ${isRTL ? 'text-right block' : ''}`}>
                Calories
              </Label>
              <Input
                id={`${type}-calories`}
                type="number"
                min="0"
                value={newFood.calories}
                onChange={(e) => onFoodChange('calories', e.target.value)}
                className="h-8 transition-all focus:ring-2 focus:ring-primary/20"
                dir="ltr"
              />
            </div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                onClick={onAddFood}
                className="mb-[2px] transition-all hover:scale-105"
                disabled={!newFood.name || newFood.calories <= 0}
              >
                <Plus className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'} transition-transform group-hover:rotate-90`} />
                Add
              </Button>
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MealCard;
