
import React from 'react';
import { Task } from '@/types/task';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Check, Clock, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StickyNoteProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

const priorityColors = {
  high: 'bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-800',
  medium: 'bg-amber-100 border-amber-300 dark:bg-amber-900/30 dark:border-amber-800',
  low: 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-800',
};

const StickyNote: React.FC<StickyNoteProps> = ({ task, onToggleComplete, onDeleteTask }) => {
  // Random rotation for sticky note effect
  const rotation = React.useMemo(() => {
    return Math.random() * 6 - 3; // Between -3 and 3 degrees
  }, [task.id]);

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const getFormattedDate = () => {
    if (!task.dueDate) return null;
    
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dueDate = new Date(task.dueDate);
    
    if (dueDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (dueDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return format(dueDate, 'MMM d');
    }
  };

  return (
    <TooltipProvider>
      <motion.div
        className={cn(
          'p-4 rounded-md border-2 shadow-md flex flex-col',
          priorityColors[task.priority],
          task.completed ? 'opacity-70' : 'opacity-100',
        )}
        style={{
          rotate: `${rotation}deg`,
          transformOrigin: 'center',
        }}
        variants={item}
        whileHover={{ 
          scale: 1.03, 
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          transition: { duration: 0.2 }
        }}
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className={cn(
            "font-medium break-words",
            task.completed && "line-through text-muted-foreground"
          )}>
            {task.title}
          </h3>
          
          <div className="ml-2 flex items-center space-x-1 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={() => onToggleComplete(task.id)}
                >
                  <Check className={cn(
                    "h-4 w-4",
                    task.completed ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                  )} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{task.completed ? 'Mark as incomplete' : 'Mark as complete'}</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={() => onDeleteTask(task.id)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete note</TooltipContent>
            </Tooltip>
          </div>
        </div>
        
        {task.notes && (
          <p className="text-sm mb-3 break-words text-muted-foreground">
            {task.notes.length > 120 
              ? `${task.notes.substring(0, 120)}...` 
              : task.notes}
          </p>
        )}
        
        <div className="mt-auto pt-2 flex items-center justify-between">
          {task.dueDate && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              <span>{getFormattedDate()}</span>
            </div>
          )}
          
          <div className="text-xs font-medium px-2 py-1 rounded-full bg-background bg-opacity-70">
            {task.priority}
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default StickyNote;
