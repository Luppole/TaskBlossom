
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useFirebase } from '@/contexts/FirebaseContext';
import { ProgressLog, FitnessGoals } from '@/types/task';

const CalorieTracker = () => {
  const { user, getMeals, getProgressLogs, createProgressLog, getFitnessGoals, updateFitnessGoals } = useFirebase();
  
  const [weight, setWeight] = useState("");
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(2000);
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from Firebase
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        setIsLoading(true);
        try {
          // Load fitness goals
          const goals = await getFitnessGoals();
          if (goals) {
            setDailyCalorieGoal(goals.dailyCalorieGoal);
          }
          
          // Load progress logs for weight tracking
          const logs = await getProgressLogs();
          setProgressLogs(logs);
          
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
          toast.error('Failed to load fitness data');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadData();
  }, [user, getMeals, getProgressLogs, getFitnessGoals]);
  
  // Prepare weight data for chart
  const prepareWeightData = () => {
    if (progressLogs.length === 0) {
      // Generate placeholder data if no real data
      return generatePlaceholderData();
    }
    
    // Sort by date, oldest first
    const sortedLogs = [...progressLogs].sort((a, b) => 
      a.date.getTime() - b.date.getTime()
    );
    
    return sortedLogs.map(log => ({
      date: format(log.date, 'MMM dd'),
      weight: log.weight
    }));
  };
  
  const generatePlaceholderData = () => {
    return Array(7).fill(null).map((_, index) => {
      const date = subDays(new Date(), 6 - index);
      return {
        date: format(date, 'MMM dd'),
        weight: null
      };
    });
  };
  
  const weightData = prepareWeightData();
  
  // Get latest weight and previous weight for comparison
  const getLatestWeight = () => {
    if (progressLogs.length === 0) return null;
    
    const sortedLogs = [...progressLogs].sort((a, b) => 
      b.date.getTime() - a.date.getTime()
    );
    
    return sortedLogs[0].weight;
  };
  
  const getWeightChange = () => {
    if (progressLogs.length < 2) return null;
    
    const sortedLogs = [...progressLogs].sort((a, b) => 
      b.date.getTime() - a.date.getTime()
    );
    
    return sortedLogs[0].weight - sortedLogs[sortedLogs.length - 1].weight;
  };
  
  const latestWeight = getLatestWeight();
  const weightChange = getWeightChange();
  
  const handleAddWeight = async () => {
    if (!weight || isNaN(parseFloat(weight))) {
      toast.error("Please enter a valid weight");
      return;
    }
    
    try {
      const newLog: Omit<ProgressLog, 'id'> = {
        date: new Date(),
        weight: parseFloat(weight)
      };
      
      const savedLog = await createProgressLog(newLog);
      setProgressLogs([savedLog, ...progressLogs]);
      
      toast.success(`Weight ${weight}kg logged for today`);
      setWeight("");
    } catch (error) {
      console.error('Error saving weight:', error);
      toast.error('Failed to save weight');
    }
  };
  
  const handleUpdateCalorieGoal = async () => {
    try {
      const goals: FitnessGoals = {
        dailyCalorieGoal,
        weeklyWorkoutGoal: 3, // Default or get from current settings
        targetWeight: latestWeight ? latestWeight * 0.95 : undefined // Set a default target 5% less than current
      };
      
      await updateFitnessGoals(goals);
      toast.success(`Daily calorie goal updated to ${dailyCalorieGoal}`);
    } catch (error) {
      console.error('Error updating calorie goal:', error);
      toast.error('Failed to update calorie goal');
    }
  };
  
  const caloriesRemaining = dailyCalorieGoal - caloriesConsumed;
  const calorieProgress = (caloriesConsumed / dailyCalorieGoal) * 100;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Progress</h2>
      </div>
      
      {isLoading ? (
        <div className="text-center py-10">
          <div className="animate-pulse">Loading your progress data...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            className="col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Daily Calories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center mb-4">
                  <div className="relative h-36 w-36 flex items-center justify-center">
                    <svg className="h-full w-full" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#e2e8f0"
                        strokeWidth="10"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 - (calorieProgress * 251.2) / 100}
                        className="text-primary transform -rotate-90 origin-center transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold">{caloriesConsumed}</span>
                      <span className="text-xs text-muted-foreground">of {dailyCalorieGoal}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-center">
                    <p className="text-sm text-muted-foreground">
                      {caloriesRemaining > 0 ? (
                        <span>{caloriesRemaining} calories remaining</span>
                      ) : (
                        <span>Exceeded by {Math.abs(caloriesRemaining)} calories</span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="calorieGoal">Daily Calorie Goal</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="calorieGoal"
                        type="number"
                        value={dailyCalorieGoal}
                        onChange={(e) => setDailyCalorieGoal(parseInt(e.target.value) || 0)}
                        min={500}
                        step={50}
                      />
                      <Button onClick={handleUpdateCalorieGoal} size="sm">Update</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            className="col-span-1 md:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Weight Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                {weightData.length > 0 && weightData.some(d => d.weight !== null) ? (
                  <div className="h-[200px] mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={weightData.filter(d => d.weight !== null)}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0.2} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                        <XAxis 
                          dataKey="date"
                          tickFormatter={(value) => value.split(' ')[1]}
                          tick={{ fontSize: 12 }}
                          tickCount={7}
                        />
                        <YAxis 
                          domain={['auto', 'auto']} 
                          tickCount={6} 
                          tick={{ fontSize: 12 }} 
                        />
                        <Tooltip 
                          formatter={(value) => [`${value}kg`, 'Weight']}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Area 
                          type="monotone"
                          dataKey="weight"
                          stroke="#8884d8" 
                          fill="url(#weightGradient)"
                          activeDot={{ r: 6 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-6 mb-4 bg-muted/30 rounded-lg">
                    <p className="text-muted-foreground">No weight data recorded yet</p>
                    <p className="text-sm mt-1">Add your weight below to start tracking</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground text-xs">Current</span>
                    <span className="text-2xl font-bold">{latestWeight ? `${latestWeight}kg` : '-'}</span>
                  </div>
                  
                  <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground text-xs">Change</span>
                    {weightChange !== null ? (
                      <span className={`text-2xl font-bold flex items-center ${weightChange < 0 ? 'text-green-500' : weightChange > 0 ? 'text-red-500' : ''}`}>
                        {weightChange < 0 ? <ArrowDownCircle className="mr-1 h-4 w-4" /> : 
                         weightChange > 0 ? <ArrowUpCircle className="mr-1 h-4 w-4" /> : null}
                        {Math.abs(weightChange).toFixed(1)}kg
                      </span>
                    ) : (
                      <span className="text-2xl font-bold">-</span>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground text-xs">Target</span>
                    <span className="text-2xl font-bold">{latestWeight ? `${(latestWeight * 0.95).toFixed(1)}kg` : '-'}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weight">Log Today's Weight</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="weight"
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="Enter weight in kg"
                      step="0.1"
                      min="30"
                    />
                    <Button onClick={handleAddWeight}>Add</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CalorieTracker;
