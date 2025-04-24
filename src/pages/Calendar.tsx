
import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Task } from '@/types/task';
import TaskList from '@/components/tasks/TaskList';
import AddTaskButton from '@/components/common/AddTaskButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import TaskModal from '@/components/tasks/TaskModal';
import { motion } from 'framer-motion';
import CalendarDay from '@/components/calendar/EnhancedCalendarView';
import { useFirebase } from '@/contexts/FirebaseContext';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';

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
    <div className="container max-w-7xl mx-auto px-4 sm:p-6 lg:p-8 h-[calc(100vh-4rem)] flex flex-col">
      <header className="mb-4">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">
          Visualize and manage your schedule
        </p>
      </header>
      
      <div className="grid grid-rows-[auto_1fr] gap-4 flex-1 min-h-0">
        <motion.div 
          className="grid gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-xl font-semibold">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handlePreviousMonth}
                    className="hover:bg-accent"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon" className="hover:bg-accent">
                        <CalendarIcon className="h-5 w-5" />
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
                    className="hover:bg-accent"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-1">
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
          className="min-h-0 overflow-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-lg font-semibold">
                  Tasks for {format(selectedDate, 'MMMM d, yyyy')}
                </h3>
                <Button onClick={() => setIsAddTaskModalOpen(true)} className="bg-primary hover:bg-primary/90 text-white shadow-md transition-all">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
              
              <div className="space-y-2">
                <TaskList 
                  tasks={selectedDateTasks} 
                  onToggleComplete={handleToggleComplete}
                  onDeleteTask={handleDeleteTask}
                />

                {selectedDateTasks.length === 0 && (
                  <motion.div 
                    className="text-center py-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <p className="text-muted-foreground mb-3">No tasks scheduled for this day</p>
                    <Button 
                      variant="outline"
                      onClick={() => setIsAddTaskModalOpen(true)}
                      className="hover:bg-accent"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Task
                    </Button>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <AddTaskButton onClick={() => setIsAddTaskModalOpen(true)} />
      
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
