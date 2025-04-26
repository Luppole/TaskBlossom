
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, Utensils, BarChart, Lock, LogIn, UserPlus } from "lucide-react";
import WorkoutLog from '@/components/fitness/WorkoutLog';
import MealLog from '@/components/fitness/MealLog';
import CalorieTracker from '@/components/fitness/CalorieTracker';
import FitnessHeader from '@/components/fitness/FitnessHeader';
import { motion } from 'framer-motion';
import { useFirebase } from '@/contexts/FirebaseContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Fitness = () => {
  const [activeTab, setActiveTab] = useState("workout-log");
  const { user } = useFirebase();
  const navigate = useNavigate();
  
  // Redirect unauthenticated users
  useEffect(() => {
    if (!user) {
      // We'll show a login prompt instead of redirecting
    }
  }, [user]);
  
  // If not logged in, show a message to login
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 flex flex-col items-center justify-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="bg-primary/10 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Lock className="h-10 w-10 text-primary" />
          </div>
          
          <h1 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            Fitness Tracker Requires Login
          </h1>
          
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            Please sign in or create an account to access the fitness tracking features.
            This allows us to save your progress and provide personalized insights.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button 
              variant="outline"
              className="gap-2"
              onClick={() => navigate('/')}
            >
              <Dumbbell className="h-4 w-4" />
              Return to Dashboard
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90 gap-2" 
              onClick={() => navigate('/settings')}
            >
              <LogIn className="h-4 w-4" />
              Sign In / Register
            </Button>
          </div>
          
          <div className="mt-10 p-5 bg-muted/30 rounded-lg">
            <h3 className="font-medium mb-2 flex items-center">
              <UserPlus className="h-4 w-4 mr-2" />
              Why create an account?
            </h3>
            <ul className="text-sm text-muted-foreground text-left list-disc pl-5 space-y-1">
              <li>Track your daily meals and workouts</li>
              <li>Monitor your calorie intake and progress</li>
              <li>Set personal fitness goals</li>
              <li>All your data is private and secure</li>
            </ul>
          </div>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <FitnessHeader />
        
        <Tabs defaultValue="workout-log" value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
            <TabsTrigger value="workout-log" className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              <span className="hidden sm:inline">Workout Log</span>
            </TabsTrigger>
            
            <TabsTrigger value="meal-log" className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              <span className="hidden sm:inline">Meal Log</span>
            </TabsTrigger>
            
            <TabsTrigger value="calories" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span className="hidden sm:inline">Progress</span>
            </TabsTrigger>
          </TabsList>
          
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            <TabsContent value="workout-log" className="mt-0">
              <WorkoutLog />
            </TabsContent>
            
            <TabsContent value="meal-log" className="mt-0">
              <MealLog />
            </TabsContent>
            
            <TabsContent value="calories" className="mt-0">
              <CalorieTracker />
            </TabsContent>
          </motion.div>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Fitness;
