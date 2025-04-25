
import React from 'react';
import { format } from 'date-fns';
import { Task } from '@/types/task';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import TaskList from '../tasks/TaskList';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';

interface DayTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: () => void;
}

const DayTasksModal: React.FC<DayTasksModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  tasks,
  onToggleComplete,
  onDeleteTask,
  onAddTask,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <motion.div
            className="flex items-center space-x-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Calendar className="h-5 w-5 text-primary" />
            <DialogTitle className="text-xl">
              Tasks for {format(selectedDate, 'MMMM d, yyyy')}
            </DialogTitle>
          </motion.div>
          <DialogDescription className="flex items-center text-sm text-muted-foreground mt-1">
            <Clock className="h-4 w-4 mr-1" />
            {format(selectedDate, 'EEEE')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 max-h-[60vh] overflow-y-auto pr-1">
          <AnimatePresence mode="wait">
            {tasks.length === 0 ? (
              <motion.div 
                className="flex flex-col items-center justify-center py-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div 
                  className="text-5xl mb-4"
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, 0, -5, 0]
                  }}
                  transition={{ 
                    repeat: Infinity,
                    duration: 5
                  }}
                >
                  ✨
                </motion.div>
                <h3 className="text-xl font-medium mb-2">No tasks for this day</h3>
                <p className="text-muted-foreground mb-4">
                  Start adding tasks to get organized
                </p>
                <Button 
                  onClick={onAddTask}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Task
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="grid grid-cols-1 gap-3 sm:p-1">
                  <TaskList
                    tasks={tasks}
                    onToggleComplete={onToggleComplete}
                    onDeleteTask={onDeleteTask}
                  />
                </div>
                <div className="flex justify-end mt-4">
                  <Button 
                    onClick={onAddTask}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add New Task
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DayTasksModal;
