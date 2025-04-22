
import React from 'react';
import { Task } from '@/types/task';
import { CheckCircle, Clock, AlertTriangle, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductivityBarProps {
  tasks: Task[];
  streak?: number;
}

const ProductivityBar: React.FC<ProductivityBarProps> = ({ tasks, streak = 3 }) => {
  const completedToday = tasks.filter(task => 
    task.completed && 
    task.dueDate && 
    task.dueDate.toDateString() === new Date().toDateString()
  ).length;
  
  const remaining = tasks.filter(task => 
    !task.completed && 
    task.dueDate && 
    task.dueDate.toDateString() === new Date().toDateString()
  ).length;
  
  const overdue = tasks.filter(task => 
    !task.completed && 
    task.dueDate && 
    task.dueDate < new Date()
  ).length;

  return (
    <div className="bg-card border rounded-lg p-3 grid grid-cols-4 gap-3">
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Completed</span>
        </div>
        <span className="font-heading font-semibold text-xl">{completedToday}</span>
      </div>
      
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
          <Clock className="h-4 w-4 text-blossom-blue" />
          <span>Remaining</span>
        </div>
        <span className="font-heading font-semibold text-xl">{remaining}</span>
      </div>
      
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span>Overdue</span>
        </div>
        <span className={cn(
          "font-heading font-semibold text-xl",
          overdue > 0 && "text-amber-500"
        )}>
          {overdue}
        </span>
      </div>
      
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
          <Flame className="h-4 w-4 text-orange-500" />
          <span>Streak</span>
        </div>
        <span className="font-heading font-semibold text-xl">{streak} days</span>
      </div>
    </div>
  );
};

export default ProductivityBar;
