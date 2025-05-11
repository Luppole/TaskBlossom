
import React from 'react';
import { Task } from '@/types/task';
import StickyNote from './StickyNote';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSupabase } from '@/contexts/SupabaseContext';

interface StickyNoteBoardProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

const StickyNoteBoard: React.FC<StickyNoteBoardProps> = ({ tasks, onToggleComplete, onDeleteTask }) => {
  const { user } = useSupabase();

  // Group tasks by completion status
  const pendingTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  // Calculate grid styles based on number of tasks
  const getGridStyles = () => {
    return {
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '1rem',
    };
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  if (!user && tasks.length === 0) {
    return (
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Sign in to manage your tasks</AlertTitle>
        <AlertDescription>
          Sign in to save your tasks and access them from any device.
        </AlertDescription>
      </Alert>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
        <h3 className="text-lg font-medium mb-2">No tasks found</h3>
        <p className="text-muted-foreground">
          Add a new task to get started with your sticky notes board.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-medium mb-4 text-primary">To Do ({pendingTasks.length})</h2>
        <motion.div
          className="grid"
          style={getGridStyles()}
          variants={container}
          initial="hidden"
          animate="show"
        >
          {pendingTasks.map((task) => (
            <StickyNote
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </motion.div>
      </div>
      
      {completedTasks.length > 0 && (
        <div>
          <h2 className="text-lg font-medium mb-4 text-muted-foreground">Completed ({completedTasks.length})</h2>
          <motion.div
            className="grid opacity-80"
            style={getGridStyles()}
            variants={container}
            initial="hidden"
            animate="show"
          >
            {completedTasks.map((task) => (
              <StickyNote
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onDeleteTask={onDeleteTask}
              />
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default StickyNoteBoard;
