
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Apple, Utensils, Pizza } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { MealLog } from '@/types/task';

interface MealStatsProps {
  today: Date;
  totalCalories: number;
  mealBreakdown: {
    breakfast: number;
    lunch: number;
    dinner: number;
    snack: number;
  };
  isRTL: boolean;
}

const MealStats: React.FC<MealStatsProps> = ({ today, totalCalories, mealBreakdown, isRTL }) => {
  return (
    <motion.div 
      className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''} flex-wrap gap-2`}
      initial={{ y: -20 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <div>
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
          Today's Food Log
        </h2>
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''} mt-1`}>
          <Clock className="h-4 w-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            {format(today, 'PPP')}
          </p>
          {totalCalories > 0 && (
            <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary font-medium">
              {totalCalories} kcal today
            </Badge>
          )}
        </div>
      </div>

      {totalCalories > 0 && (
        <div className="flex gap-2 flex-wrap">
          {Object.entries(mealBreakdown).map(([mealType, calories]) => {
            if (calories <= 0) return null;
            
            const icons = {
              breakfast: <Clock className="h-3 w-3" />,
              lunch: <Utensils className="h-3 w-3" />,
              dinner: <Pizza className="h-3 w-3" />,
              snack: <Apple className="h-3 w-3" />,
            };
            
            const colors = {
              breakfast: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
              lunch: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
              dinner: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
              snack: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
            };
            
            return (
              <motion.div
                key={mealType}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Badge 
                  variant="outline" 
                  className={`flex gap-1 text-xs font-normal ${colors[mealType as keyof typeof colors]}`}
                >
                  {icons[mealType as keyof typeof icons]}
                  {mealType.charAt(0).toUpperCase() + mealType.slice(1)}: {calories} kcal
                </Badge>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default MealStats;
