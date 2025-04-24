
import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Task } from '@/types/task';
import TaskList from '@/components/tasks/TaskList';
import AddTaskButton from '@/components/common/AddTaskButton';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import TaskModal from '@/components/tasks/TaskModal';
import { motion } from 'framer-motion';
import CalendarDay from '@/components/calendar/EnhancedCalendarView';
import { useFirebase } from '@/contexts/FirebaseContext';
import { toast } from 'sonner';

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const { getTasks, createTask, updateTask, deleteTask } = useFirebase();

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const fetchedTasks = await getTasks();
        setTasks(fetchedTasks);
      } catch (error) {
        toast.error('Failed to load tasks');
      }
    };
    loadTasks();
  }, [getTasks]);
  
  const selectedDateTasks = tasks.filter(task => 
    task.dueDate && isSameDay(task.dueDate, selectedDate)
  );

  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddTask = () => {
    setIsAddTaskModalOpen(true);
  };

  const handleTaskSave = (newTask: Task) => {
    setTasks(prevTasks => [...prevTasks, newTask]);
    setIsAddTaskModalOpen(false);
  };

  const handleToggleComplete = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  return (
    <div className="container max-w-7xl mx-auto p-8">
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground mt-2">
          Visualize your tasks and schedule across time
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-7 gap-8">
        <motion.div 
          className="md:col-span-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-xl font-semibold">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handlePreviousMonth}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon">
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && handleDateSelect(date)}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleNextMonth}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
                
                {eachDayOfInterval({
                  start: startOfWeek(startOfMonth(currentDate)),
                  end: endOfWeek(endOfMonth(currentDate))
                }).map((day) => {
                  const dayTasks = tasks.filter(task => 
                    task.dueDate && isSameDay(task.dueDate, day)
                  );
                  
                  return (
                    <CalendarDay
                      key={day.toString()}
                      day={day}
                      tasks={dayTasks}
                      isSelected={isSameDay(day, selectedDate)}
                      isToday={isSameDay(day, new Date())}
                      onClick={() => handleDateSelect(day)}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div 
          className="md:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading text-lg font-semibold">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </h3>
                <Button variant="ghost" size="icon" onClick={handleAddTask}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {selectedDateTasks.length > 0 ? (
                <TaskList 
                  tasks={selectedDateTasks} 
                  onToggleComplete={handleToggleComplete}
                  onDeleteTask={handleDeleteTask}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No tasks for this day</p>
                  <Button 
                    variant="outline" 
                    onClick={handleAddTask}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <AddTaskButton onClick={handleAddTask} />
      {isAddTaskModalOpen && (
        <TaskModal 
          isOpen={isAddTaskModalOpen}
          onClose={() => setIsAddTaskModalOpen(false)}
          onSave={handleTaskSave}
          initialDate={selectedDate}
        />
      )}
    </div>
  );
};

export default CalendarPage;
