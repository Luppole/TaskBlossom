
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { mockTasks, motivationalQuotes } from '@/data/mockData';
import TaskList from '@/components/tasks/TaskList';
import ProductivityBar from '@/components/common/ProductivityBar';
import AddTaskButton from '@/components/common/AddTaskButton';
import TaskModal from '@/components/tasks/TaskModal';
import FocusMode from '@/components/focus/FocusMode';
import { Task } from '@/types/task';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { Badge } from '@/components/ui/badge';
import { Clock, Focus } from 'lucide-react';

const Today: React.FC = () => {
  const [tasks, setTasks] = useState(mockTasks);
  const [quote, setQuote] = useState('');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const { toast } = useToast();
  
  // Register keyboard shortcuts
  useKeyboardShortcuts({
    onNewTask: () => setIsAddTaskModalOpen(true)
  });
  
  useEffect(() => {
    // Set a random quote
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setQuote(motivationalQuotes[randomIndex]);
    
    // Check if this is the first visit
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    if (!hasVisitedBefore) {
      setIsFirstVisit(true);
      localStorage.setItem('hasVisitedBefore', 'true');
    } else {
      setIsFirstVisit(false);
    }
  }, []);
  
  const handleToggleComplete = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };
  
  const handleAddTask = () => {
    setIsAddTaskModalOpen(true);
  };
  
  const handleTaskSave = (newTask: Task) => {
    setTasks(prevTasks => [...prevTasks, newTask]);
    setIsAddTaskModalOpen(false);
    
    toast({
      title: "Task added",
      description: "Your new task has been created.",
    });
  };
  
  const handleStartFocusMode = () => {
    setIsFocusModeOpen(true);
  };
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌞 Good Morning';
    if (hour < 18) return '☀️ Good Afternoon';
    return '🌙 Good Evening';
  };
  
  // Filter tasks for today
  const todaysTasks = tasks.filter(task => 
    task.dueDate && 
    task.dueDate.toDateString() === new Date().toDateString()
  );
  
  // Filter tasks based on selected filter
  const getFilteredTasks = () => {
    switch (filter) {
      case 'completed':
        return sortedTasks.filter(task => task.completed);
      case 'pending':
        return sortedTasks.filter(task => !task.completed);
      case 'overdue':
        return sortedTasks.filter(task => 
          task.dueDate && 
          task.dueDate < new Date() && 
          !task.completed
        );
      default:
        return sortedTasks;
    }
  };
  
  // Sort tasks by priority and completion status
  const sortedTasks = [...todaysTasks].sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    
    const priorityValues = { high: 0, medium: 1, low: 2 };
    return priorityValues[a.priority] - priorityValues[b.priority];
  });

  const filteredTasks = getFilteredTasks();
  const pendingCount = todaysTasks.filter(task => !task.completed).length;

  return (
    <div className="max-w-2xl mx-auto">
      <motion.header 
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-heading text-2xl font-bold mb-2">
          {getGreeting()}, User
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
        <ProductivityBar tasks={tasks} />
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
          
          {pendingCount > 0 ? (
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="flex items-center text-sm font-medium"
            >
              <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
              <span>{pendingCount} pending</span>
            </motion.div>
          ) : (
            <span className="text-sm text-green-500 font-medium">All done for today! 🎉</span>
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
        />
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
