
import React, { useState, useEffect, useCallback } from 'react';
import TaskList from '@/components/tasks/TaskList';
import AddTaskButton from '@/components/common/AddTaskButton';
import TaskModal from '@/components/tasks/TaskModal';
import { Input } from '@/components/ui/input';
import { Task } from '@/types/task';
import { Search, AlertCircle } from 'lucide-react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Tasks: React.FC = () => {
  const {
    user,
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    loading: firebaseLoading,
  } = useFirebase();

  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load tasks from Firestore
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (user) {
        const fetchedTasks = await getTasks();
        setTasks(fetchedTasks);
      } else {
        // If no user is signed in, show empty state
        setTasks([]);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setError(error instanceof Error ? error : new Error('Unknown error occurred'));
      toast.error('Failed to load tasks.');
    } finally {
      setIsLoading(false);
    }
  }, [getTasks, user]);

  useEffect(() => {
    if (!firebaseLoading) {
      fetchTasks();
    }
  }, [fetchTasks, user, firebaseLoading]);

  // Redirect to login if not authenticated after loading
  useEffect(() => {
    if (!firebaseLoading && !user) {
      toast.error('Please login to view your tasks');
      navigate('/login');
    }
  }, [firebaseLoading, user, navigate]);

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

  // Show login prompt if not authenticated
  if (!firebaseLoading && !user) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 py-12">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="mb-6">Please sign in to view and manage your tasks.</p>
          <Button onClick={() => navigate('/login')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8">
      <header className="mb-6">
        <h1 className="font-heading text-2xl font-bold mb-2">All Tasks</h1>
        <p className="text-muted-foreground">
          View, search, and manage all your tasks in one place
        </p>
      </header>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading tasks</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>There was a problem loading your tasks. Please try again.</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchTasks} 
              className="self-start"
            >
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      )}

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
        {!isLoading && !error && (
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
          error={error}
        />
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
