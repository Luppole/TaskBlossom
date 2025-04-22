
import React from 'react';
import { format } from 'date-fns';
import { Task } from '@/types/task';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useTheme } from '@/contexts/ThemeContext';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggleComplete }) => {
  const { direction } = useTheme();
  const isOverdue = task.dueDate && task.dueDate < new Date() && !task.completed;
  
  const handleCheckboxClick = () => {
    onToggleComplete(task.id);
    
    // Play completion animation if task is being completed
    if (!task.completed) {
      // Create confetti when task is completed
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };
  
  return (
    <motion.div 
      className={cn(
        "task-card p-4 rounded-lg border group relative",
        isOverdue && !task.completed && "border-destructive shadow-[0_0_0_1px_rgba(239,68,68,0.3)]",
        task.completed && "opacity-80 bg-muted/50"
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.01, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
      dir={direction}
    >
      <div className="flex items-start gap-3">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.8 }}
        >
          <Checkbox 
            checked={task.completed}
            onCheckedChange={() => handleCheckboxClick()}
            className="mt-1"
          />
        </motion.div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className={cn(
              "font-medium text-base mb-1 transition-all duration-300",
              task.completed && "line-through text-muted-foreground"
            )}>
              {task.title}
            </h3>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center mb-2">
            {task.category && (
              <span 
                className="category-badge text-xs px-2 py-1 rounded-full font-medium"
                style={{
                  backgroundColor: `${task.category.color}30`, // 30% opacity
                  color: task.category.color,
                  borderColor: task.category.color,
                  borderWidth: '1px'
                }}
              >
                {task.category.name}
              </span>
            )}
            
            {task.dueDate && (
              <span className={cn(
                "text-xs rounded-md px-1.5 py-0.5",
                isOverdue ? "bg-destructive/10 text-destructive font-medium" : "bg-muted text-muted-foreground",
              )}>
                {format(task.dueDate, 'MMM d')} 
                {format(task.dueDate, 'HH:mm') !== '00:00' && (
                  ` at ${format(task.dueDate, 'h:mm a')}`
                )}
                {isOverdue && " (Overdue)"}
              </span>
            )}
          </div>
          
          {task.notes && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
              {task.notes}
            </p>
          )}
        </div>
        
        <div className="flex-shrink-0">
          {/* Task priority indicator */}
          <span 
            className={cn(
              "inline-block h-3 w-3 rounded-full",
              task.priority === 'high' && "bg-red-500",
              task.priority === 'medium' && "bg-amber-500",
              task.priority === 'low' && "bg-green-500",
            )}
            title={`Priority: ${task.priority}`}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;
