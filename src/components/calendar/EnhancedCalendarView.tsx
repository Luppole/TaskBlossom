
import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Task } from '@/types/task';

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
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "h-16 flex flex-col items-center justify-start p-1 rounded-lg cursor-pointer transition-colors relative",
        isSelected ? "ring-2 ring-primary bg-accent" : "hover:bg-accent/50",
        isToday ? "bg-accent font-bold" : "bg-card"
      )}
    >
      <span className="text-sm">{day.getDate()}</span>
      {tasks.length > 0 && (
        <div className="absolute bottom-1 flex gap-1 justify-center w-full">
          {tasks.length <= 3 ? (
            tasks.map((task, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-1.5 h-1.5 rounded-full"
                style={{ 
                  backgroundColor: task.category?.color || '#9b87f5',
                  opacity: task.completed ? 0.5 : 1
                }}
              />
            ))
          ) : (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-xs font-medium">+{tasks.length - 2}</span>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default CalendarDay;
