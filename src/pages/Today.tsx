
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { mockTasks, motivationalQuotes } from '@/data/mockData';
import TaskList from '@/components/tasks/TaskList';
import ProductivityBar from '@/components/common/ProductivityBar';
import AddTaskButton from '@/components/common/AddTaskButton';
import TaskModal from '@/components/tasks/TaskModal';
import { Task } from '@/types/task';

const Today: React.FC = () => {
  const [tasks, setTasks] = useState(mockTasks);
  const [quote, setQuote] = useState('');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  
  useEffect(() => {
    // Set a random quote
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setQuote(motivationalQuotes[randomIndex]);
  }, []);
  
  const handleToggleComplete = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };
  
  const handleAddTask = () => {
    setIsAddTaskModalOpen(true);
  };
  
  const handleTaskSave = (newTask: Task) => {
    setTasks(prevTasks => [...prevTasks, newTask]);
    setIsAddTaskModalOpen(false);
  };
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌞 Good Morning';
    if (hour < 18) return '☀️ Good Afternoon';
    return '🌙 Good Evening';
  };
  
  // Filter tasks for today
  const todaysTasks = tasks.filter(task => 
    task.dueDate && 
    task.dueDate.toDateString() === new Date().toDateString()
  );
  
  // Sort tasks by priority and completion status
  const sortedTasks = [...todaysTasks].sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    
    const priorityValues = { high: 0, medium: 1, low: 2 };
    return priorityValues[a.priority] - priorityValues[b.priority];
  });

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6">
        <h1 className="font-heading text-2xl font-bold mb-2">
          {getGreeting()}, User
        </h1>
        <p className="text-muted-foreground italic">
          "{quote}"
        </p>
      </header>
      
      <section className="mb-6">
        <ProductivityBar tasks={tasks} />
      </section>
      
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-heading text-xl font-semibold">
            Today's Tasks ({format(new Date(), 'MMMM d')})
          </h2>
        </div>
        
        <TaskList
          tasks={sortedTasks}
          onToggleComplete={handleToggleComplete}
        />
      </section>
      
      <AddTaskButton onClick={handleAddTask} />
      
      {isAddTaskModalOpen && (
        <TaskModal 
          isOpen={isAddTaskModalOpen}
          onClose={() => setIsAddTaskModalOpen(false)}
          onSave={handleTaskSave}
          initialDate={new Date()} // Set initial date to today
        />
      )}
    </div>
  );
};

export default Today;
