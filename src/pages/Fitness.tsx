
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, Utensils, BarChart, Lock } from "lucide-react";
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
      // We could redirect, but we'll show a login prompt instead
      // to be more user-friendly
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
          <Lock className="h-16 w-16 mx-auto text-primary mb-4" />
          <h1 className="text-2xl font-bold mb-2">Fitness Tracker Requires Login</h1>
          <p className="text-muted-foreground mb-8">
            Please sign in or create an account to access the fitness tracking features.
            This allows us to save your progress and provide personalized insights.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/')}>
              Return to Dashboard
            </Button>
            <Button variant="outline" onClick={() => navigate('/settings')}>
              Sign In / Register
            </Button>
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
