
import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths, differenceInDays, isToday, addDays, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Award, Sparkles } from 'lucide-react';
import { Task } from '@/types/task';
import { useFirebase } from '@/contexts/FirebaseContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import CalendarDay from '@/components/calendar/EnhancedCalendarView';
import { Calendar } from '@/components/ui/calendar';
import TaskModal from '@/components/tasks/TaskModal';
import DayTasksModal from '@/components/calendar/DayTasksModal';

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isDayTasksModalOpen, setIsDayTasksModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [streak, setStreak] = useState(0);
  const { getTasks, createTask, updateTask, deleteTask, user } = useFirebase();

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const fetchedTasks = await getTasks();
        setTasks(fetchedTasks);
        calculateStreak(fetchedTasks);
      } catch (error) {
        toast.error('Failed to load tasks');
      }
    };
    loadTasks();
  }, [getTasks]);
  
  // Calculate the user's current streak based on completed tasks
  const calculateStreak = (userTasks: Task[]) => {
    if (!user || userTasks.length === 0) {
      setStreak(0);
      return;
    }

    // Sort tasks by date (most recent first)
    const sortedCompletedTasks = userTasks
      .filter(task => task.completed && task.completedAt)
      .sort((a, b) => {
        const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return dateB - dateA;
      });

    if (sortedCompletedTasks.length === 0) {
      setStreak(0);
      return;
    }

    // Check if there are completed tasks for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let hasCompletedTaskToday = false;
    let currentStreak = 0;
    
    for (const task of sortedCompletedTasks) {
      if (!task.completedAt) continue;
      
      const completedDate = new Date(task.completedAt);
      completedDate.setHours(0, 0, 0, 0);
      
      if (isSameDay(completedDate, today)) {
        hasCompletedTaskToday = true;
        currentStreak++;
        continue;
      }
      
      // Check for consecutive days
      const daysBetween = differenceInDays(today, completedDate);
      
      if (daysBetween === 1 && hasCompletedTaskToday) {
        // Yesterday's completion
        currentStreak++;
      } else if (daysBetween > 1) {
        // Break in the streak
        break;
      }
      
      // Look at the next day
      today.setDate(today.getDate() - 1);
    }
    
    setStreak(currentStreak);
  };
  
  const selectedDateTasks = tasks.filter(task => 
    task.dueDate && isSameDay(task.dueDate, selectedDate)
  );

  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setIsDayTasksModalOpen(true);
  };

  const handleAddTask = () => {
    setIsAddTaskModalOpen(true);
  };

  const handleTaskSave = async (newTask: Task) => {
    try {
      const savedTask = await createTask(newTask);
      setTasks(prevTasks => [...prevTasks, savedTask]);
      toast.success("Task created successfully");
      setIsAddTaskModalOpen(false);
    } catch (error) {
      toast.error("Failed to create task");
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;
    
    const updatedTask = { 
      ...targetTask, 
      completed: !targetTask.completed,
      completedAt: !targetTask.completed ? new Date().toISOString() : null
    };
    
    try {
      await updateTask(taskId, { 
        completed: updatedTask.completed,
        completedAt: updatedTask.completedAt
      });
      
      setTasks(prevTasks => 
        prevTasks.map(task =>
          task.id === taskId ? updatedTask : task
        )
      );
      
      // Recalculate streak after updating task completion status
      calculateStreak([...tasks.filter(t => t.id !== taskId), updatedTask]);
      
      if (updatedTask.completed) {
        toast.success("Task completed! 🎉");
      }
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      toast.success("Task deleted successfully");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  return (
    <div className="container max-w-7xl mx-auto p-4">
      <header className="mb-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight mb-1">Calendar</h1>
        <p className="text-muted-foreground">
          Visualize and manage your schedule
        </p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Streak Card */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-5">
              <div className="flex flex-col items-center justify-center text-center space-y-2">
                <motion.div
                  className="relative"
                  animate={{
                    scale: [1, 1.05, 1],
                    rotateZ: [0, 5, 0, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                >
                  {streak > 0 ? (
                    <Award className="h-12 w-12 text-primary" />
                  ) : (
                    <Sparkles className="h-12 w-12 text-muted-foreground" />
                  )}
                </motion.div>
                <h3 className="font-bold text-lg mt-1">
                  {streak} Day{streak !== 1 ? 's' : ''} Streak
                </h3>
                <p className="text-sm text-muted-foreground">
                  {streak > 0 
                    ? `You're on a roll! Keep it up!` 
                    : `Complete a task today to start your streak!`}
                </p>
                
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  size="sm"
                  onClick={handleAddTask}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Task
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Calendar Card */}
        <motion.div 
          className="lg:col-span-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <motion.h2 
                  className="font-heading text-xl font-semibold"
                  key={format(currentDate, 'MMMM-yyyy')}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  {format(currentDate, 'MMMM yyyy')}
                </motion.h2>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handlePreviousMonth}
                    className="hover:bg-accent"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon" className="hover:bg-accent">
                        <CalendarIcon className="h-5 w-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && handleDateSelect(date)}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleNextMonth}
                    className="hover:bg-accent"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-1">
                    {day}
                  </div>
                ))}
                
                <AnimatePresence mode="wait">
                  {eachDayOfInterval({
                    start: startOfWeek(startOfMonth(currentDate)),
                    end: endOfWeek(endOfMonth(currentDate))
                  }).map((day, index) => {
                    const dayTasks = tasks.filter(task => 
                      task.dueDate && isSameDay(task.dueDate, day)
                    );
                    
                    return (
                      <motion.div
                        key={day.toString()}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                          duration: 0.2,
                          delay: index * 0.01
                        }}
                      >
                        <CalendarDay
                          day={day}
                          tasks={dayTasks}
                          isSelected={isSameDay(day, selectedDate)}
                          isToday={isToday(day)}
                          onClick={() => handleDateSelect(day)}
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Task Modal */}
      {isAddTaskModalOpen && (
        <TaskModal 
          isOpen={isAddTaskModalOpen}
          onClose={() => setIsAddTaskModalOpen(false)}
          onSave={handleTaskSave}
          initialDate={selectedDate}
        />
      )}
      
      {/* Day Tasks Modal */}
      <DayTasksModal 
        isOpen={isDayTasksModalOpen}
        onClose={() => setIsDayTasksModalOpen(false)}
        selectedDate={selectedDate}
        tasks={selectedDateTasks}
        onToggleComplete={handleToggleComplete}
        onDeleteTask={handleDeleteTask}
        onAddTask={() => {
          setIsAddTaskModalOpen(true);
          setIsDayTasksModalOpen(false);
        }}
      />
    </div>
  );
};

export default CalendarPage;
