
import React from 'react';
import { format } from 'date-fns';
import { Task } from '@/types/task';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggleComplete }) => {
  const isOverdue = task.dueDate && task.dueDate < new Date() && !task.completed;
  
  const handleCheckboxClick = () => {
    onToggleComplete(task.id);
    
    // Play completion animation if task is being completed
    if (!task.completed) {
      // Create confetti when task is completed
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };
  
  return (
    <motion.div 
      className={cn(
        "task-card group relative",
        isOverdue && !task.completed && "border-destructive",
        task.completed && "opacity-70"
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-start gap-3">
        <Checkbox 
          checked={task.completed}
          onCheckedChange={handleCheckboxClick}
          className="mt-1"
        />
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className={cn(
              "font-medium text-base mb-1",
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
                "text-xs",
                isOverdue ? "text-destructive font-medium" : "text-muted-foreground",
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
          <span 
            className={cn(
              "priority-indicator",
              {
                "priority-high": task.priority === 'high',
                "priority-medium": task.priority === 'medium',
                "priority-low": task.priority === 'low',
              }
            )}
            title={`Priority: ${task.priority}`}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;
