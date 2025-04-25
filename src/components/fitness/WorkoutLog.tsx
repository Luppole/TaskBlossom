
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import WorkoutModal from './WorkoutModal';
import { WorkoutSession } from '@/types/task';
import { format } from 'date-fns';
import { Dumbbell, Clock, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFirebase } from '@/contexts/FirebaseContext';
import { toast } from 'sonner';

const WorkoutLog = () => {
  const { user } = useFirebase();
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([
    {
      id: '1',
      date: new Date(),
      type: 'Upper Body',
      duration: 45,
      notes: 'Felt good, increased weight on bench press',
      exercises: [
        { id: '1', name: 'Bench Press', sets: 3, reps: 10, weight: 70, notes: null },
        { id: '2', name: 'Pull-ups', sets: 3, reps: 8, weight: 0, notes: 'Bodyweight' },
        { id: '3', name: 'Shoulder Press', sets: 3, reps: 12, weight: 20, notes: null },
      ],
    },
    {
      id: '2',
      date: new Date(Date.now() - 86400000 * 2), // 2 days ago
      type: 'Lower Body',
      duration: 60,
      notes: 'Focused on form for squats',
      exercises: [
        { id: '1', name: 'Squats', sets: 4, reps: 8, weight: 90, notes: null },
        { id: '2', name: 'Deadlifts', sets: 3, reps: 6, weight: 100, notes: null },
        { id: '3', name: 'Leg Press', sets: 3, reps: 12, weight: 150, notes: null },
      ],
    }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutSession | null>(null);

  const handleAddWorkout = () => {
    setSelectedWorkout(null);
    setIsModalOpen(true);
  };

  const handleEditWorkout = (workout: WorkoutSession) => {
    setSelectedWorkout(workout);
    setIsModalOpen(true);
  };

  const handleSaveWorkout = (workout: WorkoutSession) => {
    if (selectedWorkout) {
      // Edit existing workout
      setWorkouts(workouts.map(w => w.id === workout.id ? workout : w));
      toast.success('Workout updated successfully');
    } else {
      // Add new workout
      setWorkouts([...workouts, workout]);
      toast.success('Workout added successfully');
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Workouts</h2>
        <Button onClick={handleAddWorkout}>
          <Plus className="h-4 w-4 mr-2" />
          Add Workout
        </Button>
      </div>
      
      {workouts.length === 0 ? (
        <div className="text-center py-10">
          <motion.div 
            animate={{ y: [0, -10, 0] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-4xl mb-2"
          >
            <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground" />
          </motion.div>
          <h3 className="text-lg font-medium">No workouts logged yet</h3>
          <p className="text-muted-foreground mt-1">Start logging your workouts to track your progress</p>
          <Button onClick={handleAddWorkout} className="mt-4">Add Your First Workout</Button>
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {workouts.map((workout) => (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleEditWorkout(workout)}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center">
                      <Dumbbell className="h-5 w-5 mr-2" />
                      {workout.type}
                    </CardTitle>
                    <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {workout.duration} min
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(workout.date, 'PPP')}
                  </p>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-1">
                    {workout.exercises.map((exercise) => (
                      <div key={exercise.id} className="text-sm flex justify-between">
                        <span>{exercise.name}</span>
                        <span className="text-muted-foreground">
                          {exercise.sets} × {exercise.reps} @ {exercise.weight}kg
                        </span>
                      </div>
                    ))}
                  </div>
                  {workout.notes && (
                    <p className="text-sm text-muted-foreground mt-3 italic">
                      "{workout.notes}"
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
      
      <WorkoutModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveWorkout}
        initialWorkout={selectedWorkout}
      />
    </div>
  );
};

export default WorkoutLog;
