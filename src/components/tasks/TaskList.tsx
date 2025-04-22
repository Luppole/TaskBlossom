
import React from 'react';
import { Task } from '@/types/task';
import TaskCard from './TaskCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirebase } from '@/contexts/FirebaseContext';
import { toast } from 'sonner';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  isLoading?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggleComplete, isLoading = false }) => {
  const { user, updateTask } = useFirebase();
  
  // Handle toggling task completion
  const handleToggleComplete = async (taskId: string) => {
    // Call the parent component handler
    onToggleComplete(taskId);
    
    // Find the task
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // If user is signed in, persist the change to Firebase
    if (user) {
      try {
        await updateTask(taskId, { completed: !task.completed });
      } catch (error) {
        console.error('Error updating task completion status', error);
        toast.error('Failed to update task. Please try again.');
        
        // Revert the toggle in case of an error
        onToggleComplete(taskId);
      }
    }
  };
  
  if (isLoading) {
    return (
      <motion.div 
        className="flex items-center justify-center py-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </motion.div>
    );
  }
  
  if (tasks.length === 0) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center py-10 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div 
          className="text-4xl mb-4"
          animate={{ 
            y: [0, -10, 0],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 3
          }}
        >
          ✨
        </motion.div>
        <h3 className="text-xl font-medium mb-2">No tasks here!</h3>
        <p className="text-muted-foreground">
          You're all caught up. Add a new task to get started.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1 }}
    >
      <AnimatePresence mode="popLayout">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TaskCard
              task={task}
              onToggleComplete={handleToggleComplete}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default TaskList;
