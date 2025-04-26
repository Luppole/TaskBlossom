import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { motivationalQuotes } from '@/data/taskData';
import TaskList from '@/components/tasks/TaskList';
import ProductivityBar from '@/components/common/ProductivityBar';
import AddTaskButton from '@/components/common/AddTaskButton';
import TaskModal from '@/components/tasks/TaskModal';
import FocusMode from '@/components/focus/FocusMode';
import { Task } from '@/types/task';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { Badge } from '@/components/ui/badge';
import { Clock, Focus } from 'lucide-react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { setupTaskNotifications } from '@/lib/notification-service';
import { calculateStreak } from '@/utils/streak-calculator';

const Today: React.FC = () => {
  const { 
    user,
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    userSettings,
    loading: firebaseLoading 
  } = useFirebase();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [quote, setQuote] = useState('');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  useKeyboardShortcuts({
    onNewTask: () => setIsAddTaskModalOpen(true)
  });
  
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      if (user) {
        const fetchedTasks = await getTasks();
        setTasks(fetchedTasks);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [getTasks, user]);
  
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setQuote(motivationalQuotes[randomIndex]);
    
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    if (!hasVisitedBefore) {
      setIsFirstVisit(true);
      localStorage.setItem('hasVisitedBefore', 'true');
    } else {
      setIsFirstVisit(false);
    }
    
    fetchTasks();
  }, [fetchTasks]);
  
  useEffect(() => {
    if (user && userSettings && tasks.length > 0) {
      setupTaskNotifications(tasks, {
        taskReminders: userSettings.taskReminders,
        overdueAlerts: userSettings.overdueAlerts
      });
    }
  }, [tasks, userSettings, user]);
  
  const handleToggleComplete = async (taskId: string) => {
    try {
      const taskToToggle = tasks.find(t => t.id === taskId);
      if (!taskToToggle) return;
      
      const now = new Date().toISOString();
      
      setTasks(prev => 
        prev.map(t => t.id === taskId ? { 
          ...t, 
          completed: !t.completed,
          completedAt: !t.completed ? now : null 
        } : t)
      );
      
      if (user) {
        await updateTask(taskId, { 
          completed: !taskToToggle.completed,
          completedAt: !taskToToggle.completed ? now : null
        });
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
      toast.error('Failed to update task');
      
      const taskToToggle = tasks.find(t => t.id === taskId);
      if (!taskToToggle) return;
      
      setTasks(prev => 
        prev.map(t => t.id === taskId ? { 
          ...t, 
          completed: taskToToggle.completed,
          completedAt: taskToToggle.completedAt 
        } : t)
      );
    }
  };
  
  const handleDeleteTask = async (taskId: string) => {
    try {
      const taskToDelete = tasks.find(t => t.id === taskId);
      if (!taskToDelete) return;
      
      setTasks(prev => prev.filter(t => t.id !== taskId));
      
      if (user) {
        await deleteTask(taskId);
        toast.success('Task deleted');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      
      fetchTasks();
    }
  };
  
  const handleAddTask = () => {
    setIsAddTaskModalOpen(true);
  };
  
  const handleTaskSave = async (newTask: Task) => {
    try {
      if (user) {
        const savedTask = await createTask({
          title: newTask.title,
          completed: newTask.completed,
          dueDate: newTask.dueDate,
          priority: newTask.priority,
          category: newTask.category,
          notes: newTask.notes,
        });
        setTasks(prev => [savedTask, ...prev]);
      } else {
        setTasks(prev => [newTask, ...prev]);
      }
      setIsAddTaskModalOpen(false);
      toast.success('Task added');
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to add task');
    }
  };
  
  const handleStartFocusMode = () => {
    setIsFocusModeOpen(true);
  };
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌞 Good Morning';
    if (hour < 18) return '☀️ Good Afternoon';
    return '🌙 Good Evening';
  };
  
  const todaysTasks = tasks.filter(task => {
    const isToday = task.dueDate && 
      task.dueDate.toDateString() === new Date().toDateString();
      
    const isOverdue = task.dueDate && 
      task.dueDate < new Date() && 
      !task.completed;
      
    return isToday || isOverdue;
  });
  
  const getFilteredTasks = () => {
    switch (filter) {
      case 'completed':
        return todaysTasks.filter(task => task.completed);
      case 'pending':
        return todaysTasks.filter(task => !task.completed);
      case 'overdue':
        return todaysTasks.filter(task => 
          task.dueDate && 
          task.dueDate < new Date() && 
          !task.completed
        );
      default:
        return todaysTasks;
    }
  };
  
  const sortedTasks = [...todaysTasks].sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    
    const priorityValues = { high: 0, medium: 1, low: 2 };
    return priorityValues[a.priority] - priorityValues[b.priority];
  });

  const filteredTasks = getFilteredTasks();
  const pendingCount = todaysTasks.filter(task => !task.completed).length;

  const streak = calculateStreak(tasks);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8">
      <motion.header 
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-heading text-2xl font-bold mb-2">
          {getGreeting()}, {user?.displayName || 'Guest'}
        </h1>
        <p className="text-muted-foreground italic">
          "{quote}"
        </p>
        
        {isFirstVisit && (
          <motion.div 
            className="mt-4 p-4 bg-accent rounded-lg border border-border"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 1 }}
          >
            <p className="font-medium">Welcome to TaskBlossom! 🌸</p>
            <p className="text-sm mt-1">Press <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt+N</kbd> anytime to add a new task.</p>
          </motion.div>
        )}
      </motion.header>
      
      <section className="mb-6">
        <ProductivityBar tasks={todaysTasks} streak={streak} />
      </section>
      
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button 
          onClick={handleStartFocusMode}
          className="w-full mb-6 py-6 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all shadow-md"
        >
          <Focus className="mr-2 h-5 w-5" /> 
          Start Focus Mode
        </Button>
      </motion.div>
      
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-heading text-xl font-semibold">
            Today's Tasks ({format(new Date(), 'MMMM d')})
          </h2>
          
          {!isLoading && (
            pendingCount > 0 ? (
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="flex items-center text-sm font-medium"
              >
                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>{pendingCount} pending</span>
              </motion.div>
            ) : (
              todaysTasks.length > 0 ? (
                <span className="text-sm text-green-500 font-medium">All done for today! 🎉</span>
              ) : null
            )
          )}
        </div>
        
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <Badge 
            variant={filter === 'all' ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => setFilter('all')}
          >
            All
          </Badge>
          <Badge 
            variant={filter === 'pending' ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => setFilter('pending')}
          >
            Pending
          </Badge>
          <Badge 
            variant={filter === 'completed' ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => setFilter('completed')}
          >
            Completed
          </Badge>
          <Badge 
            variant={filter === 'overdue' ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => setFilter('overdue')}
          >
            Overdue
          </Badge>
        </div>
        
        <TaskList
          tasks={filteredTasks}
          onToggleComplete={handleToggleComplete}
          onDeleteTask={handleDeleteTask}
          isLoading={isLoading || firebaseLoading}
        />
        
        {!isLoading && !user && (
          <div className="mt-4 p-4 bg-muted rounded-lg text-center">
            <p className="mb-2">Sign in to save your tasks and access them from any device.</p>
            <p className="text-sm text-muted-foreground">Your tasks will be stored locally until you sign in.</p>
          </div>
        )}
      </section>
      
      <AddTaskButton onClick={handleAddTask} />
      
      {isAddTaskModalOpen && (
        <TaskModal 
          isOpen={isAddTaskModalOpen}
          onClose={() => setIsAddTaskModalOpen(false)}
          onSave={handleTaskSave}
          initialDate={new Date()} // Set initial date to today
        />
      )}
      
      <FocusMode 
        isOpen={isFocusModeOpen}
        onClose={() => setIsFocusModeOpen(false)}
      />
    </div>
  );
};

export default Today;
