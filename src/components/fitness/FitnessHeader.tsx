
import React from 'react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dumbbell } from 'lucide-react';

const FitnessHeader = () => {
  const { user } = useFirebase();
  
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
              <span className="text-xl font-bold">3/5</span>
            </div>
            <Progress value={60} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-2">60% of weekly goal</p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Calories Today</h3>
              <span className="text-xl font-bold">1,450/2,000</span>
            </div>
            <Progress value={72.5} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-2">550 calories remaining</p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Current Streak</h3>
              <span className="text-xl font-bold">5 days</span>
            </div>
            <div className="flex justify-between mt-2">
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <div 
                    key={day} 
                    className={`w-5 h-5 rounded-full ${day <= 5 ? 'bg-primary' : 'bg-muted'} flex items-center justify-center`}
                  >
                    {day <= 5 && <span className="text-[10px] text-primary-foreground">✓</span>}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Keep going strong!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FitnessHeader;
