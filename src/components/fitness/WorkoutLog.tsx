
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import WorkoutModal from './WorkoutModal';
import { WorkoutSession } from '@/types/task';
import { format } from 'date-fns';
import { Dumbbell, Clock, Plus, Flame, Calendar, Award, BarChart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirebase } from '@/contexts/FirebaseContext';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const WorkoutLog = () => {
  const { user, getWorkouts, createWorkout, updateWorkout, deleteWorkout } = useFirebase();
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load workouts from Firebase
  useEffect(() => {
    const loadWorkouts = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const fetchedWorkouts = await getWorkouts();
          setWorkouts(fetchedWorkouts);
        } catch (error) {
          console.error('Error loading workouts:', error);
          toast.error('Failed to load workouts');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadWorkouts();
  }, [user, getWorkouts]);

  const handleAddWorkout = () => {
    setSelectedWorkout(null);
    setIsModalOpen(true);
  };

  const handleEditWorkout = (workout: WorkoutSession) => {
    setSelectedWorkout(workout);
    setIsModalOpen(true);
  };

  const handleSaveWorkout = async (workout: WorkoutSession) => {
    try {
      if (selectedWorkout) {
        // Edit existing workout
        await updateWorkout(workout.id, workout);
        setWorkouts(workouts.map(w => w.id === workout.id ? workout : w));
        toast.success('Workout updated successfully');
      } else {
        // Add new workout
        const newWorkout = await createWorkout(workout);
        setWorkouts([newWorkout, ...workouts]);
        toast.success('Workout added successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving workout:', error);
      toast.error('Failed to save workout');
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    try {
      await deleteWorkout(workoutId);
      setWorkouts(workouts.filter(w => w.id !== workoutId));
      toast.success('Workout deleted successfully');
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast.error('Failed to delete workout');
    }
  };

  // Calculate total workouts stats
  const totalDuration = workouts.reduce((sum, workout) => sum + workout.duration, 0);
  const workoutTypes = [...new Set(workouts.map(w => w.type))].length;

  return (
    <div className="space-y-6">
      <motion.div 
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Your Workouts</h2>
          <p className="text-muted-foreground text-sm">Track your fitness progress</p>
        </div>
        <Button 
          onClick={handleAddWorkout}
          className="group transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]"
        >
          <motion.span
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90 duration-300" />
            Add Workout
          </motion.span>
        </Button>
      </motion.div>
      
      {/* Stats Overview */}
      {!isLoading && workouts.length > 0 && (
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="overflow-hidden hover:shadow-md transition-all duration-300">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <motion.div 
                className="rounded-full bg-primary/10 p-3 mb-2"
                whileHover={{ scale: 1.1, rotate: 10 }}
              >
                <Calendar className="h-5 w-5 text-primary" />
              </motion.div>
              <p className="text-2xl font-bold">{workouts.length}</p>
              <p className="text-xs text-muted-foreground">Total Workouts</p>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden hover:shadow-md transition-all duration-300">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <motion.div 
                className="rounded-full bg-orange-100 dark:bg-orange-900/30 p-3 mb-2"
                whileHover={{ scale: 1.1, rotate: -10 }}
              >
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </motion.div>
              <p className="text-2xl font-bold">{totalDuration}</p>
              <p className="text-xs text-muted-foreground">Minutes Trained</p>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden hover:shadow-md transition-all duration-300">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <motion.div 
                className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 mb-2"
                whileHover={{ scale: 1.1, rotate: 10 }}
              >
                <Dumbbell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </motion.div>
              <p className="text-2xl font-bold">{workoutTypes}</p>
              <p className="text-xs text-muted-foreground">Workout Types</p>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden hover:shadow-md transition-all duration-300">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <motion.div 
                className="rounded-full bg-green-100 dark:bg-green-900/30 p-3 mb-2"
                whileHover={{ scale: 1.1, rotate: -10 }}
              >
                <Flame className="h-5 w-5 text-green-600 dark:text-green-400" />
              </motion.div>
              <p className="text-2xl font-bold">{Math.round(totalDuration * 7.5)}</p>
              <p className="text-xs text-muted-foreground">Est. Calories Burned</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
      
      {isLoading ? (
        <div className="text-center py-10">
          <motion.div 
            className="animate-pulse"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            Loading workouts...
          </motion.div>
        </div>
      ) : workouts.length === 0 ? (
        <motion.div 
          className="text-center py-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            animate={{ y: [0, -10, 0] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-4xl mb-2"
          >
            <Dumbbell className="h-16 w-16 mx-auto text-muted-foreground opacity-40" />
          </motion.div>
          <h3 className="text-lg font-medium mt-4">No workouts logged yet</h3>
          <p className="text-muted-foreground mt-1 max-w-md mx-auto">Start logging your workouts to track your progress and stay motivated on your fitness journey</p>
          <Button 
            onClick={handleAddWorkout} 
            className="mt-6 animate-bounce-subtle hover:animate-none"
            size="lg"
          >
            <Dumbbell className="mr-2 h-4 w-4" />
            Add Your First Workout
          </Button>
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {workouts.map((workout, index) => (
              <motion.div
                key={workout.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3 }}
                className="card-hover"
              >
                <Card 
                  className="overflow-hidden cursor-pointer border transition-all hover:border-primary/20"
                  onClick={() => handleEditWorkout(workout)}
                >
                  <CardHeader className="pb-2 bg-gradient-to-br from-transparent to-primary/5 dark:from-transparent dark:to-primary/10">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <motion.div 
                          className="p-2 rounded-full bg-primary/10"
                          whileHover={{ rotate: 15 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Dumbbell className="h-4 w-4 text-primary" />
                        </motion.div>
                        <span className="font-medium">{workout.type}</span>
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary flex items-center gap-1 font-medium">
                          <Clock className="h-3 w-3 mr-1" />
                          {workout.duration} min
                        </Badge>
                        {index === 0 && (
                          <Badge className="animate-pulse-light bg-green-600 text-white">
                            <Award className="h-3 w-3 mr-1" />
                            Latest
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1 inline" />
                      {format(workout.date, 'PPP')}
                    </p>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="space-y-2">
                      {workout.exercises.map((exercise, idx) => (
                        <motion.div 
                          key={exercise.id} 
                          className="text-sm flex justify-between items-center p-2 rounded-md hover:bg-muted/50 transition-colors"
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ x: 3 }}
                        >
                          <span className="font-medium">{exercise.name}</span>
                          <span className="text-muted-foreground flex items-center bg-muted/40 px-2 py-1 rounded text-xs">
                            <BarChart className="h-3 w-3 mr-1" />
                            {exercise.sets} × {exercise.reps} @ {exercise.weight}kg
                          </span>
                        </motion.div>
                      ))}
                    </div>
                    {workout.notes && (
                      <motion.div 
                        className="text-sm text-muted-foreground mt-3 italic bg-muted/30 p-2 rounded-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        "{workout.notes}"
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
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
