
import React from 'react';
import { format } from 'date-fns';
import { Task } from '@/types/task';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggleComplete }) => {
  const isOverdue = task.dueDate && task.dueDate < new Date() && !task.completed;
  
  return (
    <div className={cn(
      "task-card group",
      task.completed && "opacity-70"
    )}>
      <div className="flex items-start gap-3">
        <Checkbox 
          checked={task.completed}
          onCheckedChange={() => onToggleComplete(task.id)}
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
                className="category-badge"
                style={{
                  backgroundColor: `${task.category.color}30`, // 30% opacity
                  color: task.category.color.replace('30', ''), // Remove opacity for text
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
    </div>
  );
};

export default TaskCard;
