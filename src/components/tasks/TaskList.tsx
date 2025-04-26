import React from 'react';
import TaskCard from './TaskCard';
import { Task } from '@/types/task';
import { AnimatePresence, motion } from 'framer-motion';
import { Skeleton } from '../ui/skeleton';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  isLoading?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleComplete,
  onDeleteTask,
  isLoading = false,
}) => {
  // Function to render skeleton loading state
  const renderSkeletons = () => {
    return Array(3)
      .fill(0)
      .map((_, index) => (
        <motion.div
          key={`skeleton-${index}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="mb-4"
        >
          <Skeleton className="h-24 w-full rounded-md" />
        </motion.div>
      ));
  };

  // If loading, show skeletons
  if (isLoading) {
    return (
      <div className="py-4">
        {renderSkeletons()}
      </div>
    );
  }

  // If no tasks, show empty state
  if (tasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="py-8 text-center"
      >
        <p className="text-muted-foreground">No tasks found.</p>
      </motion.div>
    );
  }

  // Otherwise, show tasks
  return (
    <motion.div
      className="py-2 space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="popLayout">
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30,
              delay: index * 0.05,
            }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <TaskCard
              task={task}
              onToggleComplete={onToggleComplete}
              onDelete={onDeleteTask}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default TaskList;
