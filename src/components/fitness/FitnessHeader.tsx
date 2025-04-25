
import React, { useState, useEffect } from 'react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dumbbell } from 'lucide-react';
import { startOfWeek, endOfWeek, isSameDay, format } from 'date-fns';

const FitnessHeader = () => {
  const { user, getWorkouts, getMeals, getFitnessGoals } = useFirebase();
  const [workoutCount, setWorkoutCount] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState(3);
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        setIsLoading(true);
        try {
          // Load fitness goals
          const goals = await getFitnessGoals();
          if (goals) {
            setWeeklyGoal(goals.weeklyWorkoutGoal);
            setCalorieGoal(goals.dailyCalorieGoal);
          }
          
          // Count this week's workouts
          const now = new Date();
          const start = startOfWeek(now, { weekStartsOn: 1 }); // Monday as start of week
          const end = endOfWeek(now, { weekStartsOn: 1 });
          
          const workouts = await getWorkouts();
          const thisWeekWorkouts = workouts.filter(workout => 
            workout.date >= start && workout.date <= end
          );
          setWorkoutCount(thisWeekWorkouts.length);
          
          // Calculate streak based on consecutive days with workouts
          // This is a simple implementation - could be more sophisticated
          let currentStreak = 0;
          const workoutDates = new Set(workouts.map(w => format(w.date, 'yyyy-MM-dd')));
          
          for (let i = 0; i < 30; i++) { // Check up to 30 days back
            const checkDate = new Date();
            checkDate.setDate(checkDate.getDate() - i);
            
            if (workoutDates.has(format(checkDate, 'yyyy-MM-dd'))) {
              currentStreak++;
            } else if (i > 0) { // Skip today if no workout
              break;
            }
          }
          setStreak(currentStreak);
          
          // Get today's calories
          const today = new Date();
          const meals = await getMeals(today);
          
          let totalCalories = 0;
          meals.forEach(meal => {
            meal.foods.forEach(food => {
              totalCalories += food.calories;
            });
          });
          
          setCaloriesConsumed(totalCalories);
          
        } catch (error) {
          console.error('Error loading fitness data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadData();
  }, [user, getWorkouts, getMeals, getFitnessGoals]);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold flex items-center gap-2">
            <Dumbbell className="h-8 w-8 text-primary" />
            Fitness Tracker
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your workouts, meals, and progress
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Weekly Workouts</h3>
              <span className="text-xl font-bold">{workoutCount}/{weeklyGoal}</span>
            </div>
            <Progress 
              value={weeklyGoal > 0 ? (workoutCount / weeklyGoal) * 100 : 0} 
              className="mt-2 h-2" 
            />
            <p className="text-xs text-muted-foreground mt-2">
              {weeklyGoal > 0 
                ? `${Math.round((workoutCount / weeklyGoal) * 100)}% of weekly goal` 
                : 'Set a weekly goal in settings'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Calories Today</h3>
              <span className="text-xl font-bold">{caloriesConsumed}/{calorieGoal}</span>
            </div>
            <Progress 
              value={calorieGoal > 0 ? (caloriesConsumed / calorieGoal) * 100 : 0} 
              className="mt-2 h-2" 
            />
            <p className="text-xs text-muted-foreground mt-2">
              {calorieGoal > caloriesConsumed 
                ? `${calorieGoal - caloriesConsumed} calories remaining` 
                : `${caloriesConsumed - calorieGoal} calories over goal`}
            </p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Current Streak</h3>
              <span className="text-xl font-bold">{streak} days</span>
            </div>
            <div className="flex justify-between mt-2">
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <div 
                    key={day} 
                    className={`w-5 h-5 rounded-full ${day <= streak ? 'bg-primary' : 'bg-muted'} flex items-center justify-center`}
                  >
                    {day <= streak && <span className="text-[10px] text-primary-foreground">✓</span>}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {streak > 0 ? 'Keep going strong!' : 'Start your workout streak today!'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FitnessHeader;
