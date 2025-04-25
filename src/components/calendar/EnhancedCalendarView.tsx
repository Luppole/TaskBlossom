
import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Task } from '@/types/task';
import { format } from 'date-fns';

interface CalendarDayProps {
  day: Date;
  tasks: Task[];
  isSelected: boolean;
  isToday: boolean;
  onClick: () => void;
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  day,
  tasks,
  isSelected,
  isToday,
  onClick,
}) => {
  const isCurrentMonth = day.getMonth() === new Date().getMonth();
  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "h-16 flex flex-col items-center justify-start p-1 rounded-lg cursor-pointer transition-all relative",
        isSelected 
          ? "ring-2 ring-primary bg-accent shadow-md" 
          : "hover:bg-accent/50 hover:shadow-sm",
        isToday 
          ? "bg-primary/10 font-bold border border-primary/30" 
          : isCurrentMonth 
            ? "bg-card" 
            : "bg-muted/30 text-muted-foreground"
      )}
    >
      <span className={cn(
        "text-sm font-medium",
        isToday && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center"
      )}>
        {format(day, 'd')}
      </span>
      
      {tasks.length > 0 && (
        <div className="absolute bottom-1 flex gap-1 justify-center w-full">
          {tasks.length <= 3 ? (
            tasks.map((task, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  task.completed && "opacity-50"
                )}
                style={{ 
                  backgroundColor: task.category?.color || '#9b87f5',
                }}
              />
            ))
          ) : (
            <>
              <motion.div 
                initial={{ x: -5, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-1.5 h-1.5 rounded-full bg-primary" 
              />
              <motion.div 
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="w-1.5 h-1.5 rounded-full bg-primary" 
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span className="text-xs font-medium">+{tasks.length - 2}</span>
              </motion.div>
            </>
          )}
        </div>
      )}
      
      {pendingTasks.length > 0 && (
        <motion.div
          className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500"
          initial={{ scale: 0 }}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            repeat: Infinity,
            duration: 2
          }}
        />
      )}
      
      {tasks.length > 0 && completedTasks.length === tasks.length && (
        <motion.div 
          className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-green-500"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            repeat: Infinity,
            duration: 2
          }}
        />
      )}
    </motion.div>
  );
};

export default CalendarDay;
