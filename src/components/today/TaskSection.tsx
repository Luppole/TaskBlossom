
import React from 'react';
import { Task } from '@/types/task';
import TaskList from '@/components/tasks/TaskList';
import TaskFilters from './TaskFilters';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface TaskSectionProps {
  tasks: Task[];
  filter: string;
  onFilterChange: (filter: string) => void;
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  isLoading: boolean;
  user: any;
  pendingCount: number;
}

const TaskSection: React.FC<TaskSectionProps> = ({
  tasks,
  filter,
  onFilterChange,
  onToggleComplete,
  onDeleteTask,
  isLoading,
  user,
  pendingCount
}) => {
  return (
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
            tasks.length > 0 ? (
              <span className="text-sm text-green-500 font-medium">All done for today! 🎉</span>
            ) : null
          )
        )}
      </div>
      
      <TaskFilters filter={filter} onFilterChange={onFilterChange} />
      
      <TaskList
        tasks={tasks}
        onToggleComplete={onToggleComplete}
        onDeleteTask={onDeleteTask}
        isLoading={isLoading}
      />
      
      {!isLoading && !user && (
        <div className="mt-4 p-4 bg-muted rounded-lg text-center">
          <p className="mb-2">Sign in to save your tasks and access them from any device.</p>
          <p className="text-sm text-muted-foreground">Your tasks will be stored locally until you sign in.</p>
        </div>
      )}
    </section>
  );
};

export default TaskSection;
