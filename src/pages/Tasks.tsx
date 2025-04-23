
import React, { useState, useEffect, useCallback } from 'react';
import TaskList from '@/components/tasks/TaskList';
import AddTaskButton from '@/components/common/AddTaskButton';
import TaskModal from '@/components/tasks/TaskModal';
import { Input } from '@/components/ui/input';
import { Task } from '@/types/task';
import { Search } from 'lucide-react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const Tasks: React.FC = () => {
  const {
    user,
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    loading: firebaseLoading,
  } = useFirebase();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks from Firestore
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      if (user) {
        const fetchedTasks = await getTasks();
        setTasks(fetchedTasks);
      } else {
        setTasks([]);
      }
    } catch (error) {
      toast.error('Failed to load tasks.');
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [getTasks, user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, user]);

  const handleToggleComplete = async (taskId: string) => {
    try {
      const taskToToggle = tasks.find((t) => t.id === taskId);
      if (!taskToToggle) return;
      
      // Optimistically update UI
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        )
      );
      
      // If user is signed in, persist to Firebase
      if (user) {
        await updateTask(taskId, { completed: !taskToToggle.completed });
      }
    } catch (error) {
      console.error('Error updating task completion:', error);
      toast.error('Failed to update task.');
      
      // Revert on error
      const taskToToggle = tasks.find((t) => t.id === taskId);
      if (!taskToToggle) return;
      
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, completed: taskToToggle.completed } : t
        )
      );
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      // Optimistically remove from UI
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      
      // If user is signed in, delete from Firebase
      if (user) {
        await deleteTask(taskId);
        toast.success('Task deleted');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task.');
      
      // Revert deletion on error
      fetchTasks();
    }
  };

  const handleAddTask = () => {
    setIsAddTaskModalOpen(true);
  };

  const handleTaskSave = async (newTask: Task) => {
    try {
      if (user) {
        const savedTask = await createTask({
          // omit id and createdAt because context will assign them
          title: newTask.title,
          completed: newTask.completed,
          dueDate: newTask.dueDate,
          priority: newTask.priority,
          category: newTask.category,
          notes: newTask.notes,
        });
        
        setTasks((prev) => [savedTask, ...prev]);
      } else {
        // If no user, just add to local state with generated id
        setTasks((prev) => [newTask, ...prev]);
      }
      
      setIsAddTaskModalOpen(false);
      toast.success('Task added');
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task.');
    }
  };

  // Filter tasks based on search query
  const filteredTasks = tasks.filter((task) =>
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8">
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
        {!isLoading && (
          <span>Showing {sortedTasks.length} {sortedTasks.length === 1 ? 'task' : 'tasks'}</span>
        )}
      </div>

      {/* Task list with delete functionality */}
      <div>
        <TaskList
          tasks={sortedTasks}
          onToggleComplete={handleToggleComplete}
          onDeleteTask={handleDeleteTask}
          isLoading={firebaseLoading || isLoading}
        />
        
        {!isLoading && !user && (
          <div className="mt-4 p-4 bg-muted rounded-lg text-center">
            <p className="mb-2">Sign in to save your tasks and access them from any device.</p>
            <p className="text-sm text-muted-foreground">Your tasks will be stored locally until you sign in.</p>
          </div>
        )}
      </div>

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
