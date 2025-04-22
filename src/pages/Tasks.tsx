
import React, { useState } from 'react';
import { mockTasks } from '@/data/mockData';
import TaskList from '@/components/tasks/TaskList';
import AddTaskButton from '@/components/common/AddTaskButton';
import TaskModal from '@/components/tasks/TaskModal';
import { Input } from '@/components/ui/input';
import { Task } from '@/types/task';
import { Search } from 'lucide-react';

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState(mockTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  
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
  
  // Filter tasks based on search query
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.notes && task.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (task.category && task.category.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Sort tasks by due date, priority, and completion status
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    
    // Sort by due date (tasks without due date go to the bottom)
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    if (a.dueDate && b.dueDate) {
      if (a.dueDate < b.dueDate) return -1;
      if (a.dueDate > b.dueDate) return 1;
    }
    
    // If same due date or no due dates, sort by priority
    const priorityValues = { high: 0, medium: 1, low: 2 };
    return priorityValues[a.priority] - priorityValues[b.priority];
  });

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6">
        <h1 className="font-heading text-2xl font-bold mb-2">All Tasks</h1>
        <p className="text-muted-foreground">
          View, search, and manage all your tasks in one place
        </p>
      </header>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Search tasks..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="mb-2 text-sm text-muted-foreground">
        Showing {sortedTasks.length} of {tasks.length} tasks
      </div>
      
      <TaskList
        tasks={sortedTasks}
        onToggleComplete={handleToggleComplete}
      />
      
      <AddTaskButton onClick={handleAddTask} />
      
      {isAddTaskModalOpen && (
        <TaskModal 
          isOpen={isAddTaskModalOpen}
          onClose={() => setIsAddTaskModalOpen(false)}
          onSave={handleTaskSave}
        />
      )}
    </div>
  );
};

export default Tasks;
