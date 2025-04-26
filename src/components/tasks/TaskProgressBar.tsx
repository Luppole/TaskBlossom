
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TaskProgressBarProps {
  completed: number;
  total: number;
  className?: string;
}

const TaskProgressBar: React.FC<TaskProgressBarProps> = ({ 
  completed, 
  total,
  className
}) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium">
          {completed} of {total} tasks completed
        </p>
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-sm font-semibold text-primary"
        >
          {percentage}%
        </motion.span>
      </div>
      
      <Progress 
        value={percentage} 
        className="h-2 bg-muted"
      />
      
      {percentage === 100 && (
        <motion.div 
          className="text-xs text-center text-muted-foreground"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          All tasks completed! 🎉
        </motion.div>
      )}
    </div>
  );
};

export default TaskProgressBar;
