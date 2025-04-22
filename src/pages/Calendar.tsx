
import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { mockTasks } from '@/data/mockData';
import { Task } from '@/types/task';
import TaskList from '@/components/tasks/TaskList';
import AddTaskButton from '@/components/common/AddTaskButton';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import TaskModal from '@/components/tasks/TaskModal';

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [tasks, setTasks] = useState(mockTasks);
  
  // Get tasks for the selected date
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
  
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Calendar</h1>
        <p className="text-muted-foreground">
          Visualize your tasks and schedule across time
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-7 md:gap-6">
        <div className="md:col-span-5 mb-6 md:mb-0">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-lg font-semibold">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div className="flex space-x-2">
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
              
              <div className="grid grid-cols-7 gap-1 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-xs font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
                
                {eachDayOfInterval({
                  start: startOfWeek(startOfMonth(currentDate)),
                  end: endOfWeek(endOfMonth(currentDate))
                }).map((day) => {
                  // Get tasks for this day
                  const dayTasks = tasks.filter(task => 
                    task.dueDate && isSameDay(task.dueDate, day)
                  );
                  
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isSelected = isSameDay(day, selectedDate);
                  const isToday = isSameDay(day, new Date());
                  
                  return (
                    <div
                      key={day.toString()}
                      onClick={() => handleDateSelect(day)}
                      className={cn(
                        "h-12 md:h-16 flex flex-col items-center justify-start p-1 rounded-md cursor-pointer transition-colors relative",
                        isCurrentMonth ? "bg-card" : "bg-muted/50 text-muted-foreground",
                        isSelected ? "ring-2 ring-primary" : "",
                        isToday ? "bg-accent" : ""
                      )}
                    >
                      <span className={cn(
                        "text-xs md:text-sm",
                        isToday && "font-bold"
                      )}>
                        {format(day, 'd')}
                      </span>
                      {dayTasks.length > 0 && (
                        <div className="absolute bottom-1 flex gap-1 justify-center w-full">
                          {dayTasks.length <= 3 ? (
                            dayTasks.map((task, i) => (
                              <div 
                                key={i}
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
                              <div className="text-xs font-medium">+{dayTasks.length - 2}</div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
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
                />
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No tasks for this day</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={handleAddTask}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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
