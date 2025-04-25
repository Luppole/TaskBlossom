
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { ArrowUpCircle, ArrowDownCircle, DollarSign } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const CalorieTracker = () => {
  const [weight, setWeight] = useState("");
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(2000);
  
  // Mock data for progress chart
  const generateMockWeightData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = subDays(today, i);
      const baseWeight = 75;
      const randomVariation = Math.random() * 1 - 0.5; // Between -0.5 and 0.5
      data.push({
        date: format(date, 'MMM dd'),
        weight: parseFloat((baseWeight - (i / 60) + randomVariation).toFixed(1))
      });
    }
    
    return data;
  };
  
  const weightData = generateMockWeightData();
  const latestWeight = weightData[weightData.length - 1].weight;
  const previousWeight = weightData[0].weight;
  const weightChange = latestWeight - previousWeight;
  
  const handleAddWeight = () => {
    if (!weight || isNaN(parseFloat(weight))) {
      toast.error("Please enter a valid weight");
      return;
    }
    
    // In a real app, you'd save this weight to your database
    toast.success(`Weight ${weight}kg logged for today`);
    setWeight("");
  };
  
  const handleUpdateCalorieGoal = () => {
    toast.success(`Daily calorie goal updated to ${dailyCalorieGoal}`);
  };
  
  // Mock calorie data for today
  const caloriesConsumed = 1450;
  const caloriesRemaining = dailyCalorieGoal - caloriesConsumed;
  const calorieProgress = (caloriesConsumed / dailyCalorieGoal) * 100;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Progress</h2>
      </div>
      
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
              <div className="h-[200px] mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={weightData}
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
                      domain={['dataMin - 1', 'dataMax + 1']} 
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
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground text-xs">Current</span>
                  <span className="text-2xl font-bold">{latestWeight}kg</span>
                </div>
                
                <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground text-xs">Change (30d)</span>
                  <span className={`text-2xl font-bold flex items-center ${weightChange < 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {weightChange < 0 ? <ArrowDownCircle className="mr-1 h-4 w-4" /> : <ArrowUpCircle className="mr-1 h-4 w-4" />}
                    {Math.abs(weightChange).toFixed(1)}kg
                  </span>
                </div>
                
                <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground text-xs">Target</span>
                  <span className="text-2xl font-bold">72.0kg</span>
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
    </div>
  );
};

export default CalorieTracker;
