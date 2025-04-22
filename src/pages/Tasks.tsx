
import React, { useState, useEffect, useCallback } from 'react';
import TaskList from '@/components/tasks/TaskList';
import AddTaskButton from '@/components/common/AddTaskButton';
import TaskModal from '@/components/tasks/TaskModal';
import { Input } from '@/components/ui/input';
import { Task } from '@/types/task';
import { Search, Trash2 } from 'lucide-react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
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
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      toast.error('Failed to load tasks.');
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [getTasks]);

  useEffect(() => {
    if (user) {
      fetchTasks();
    } else {
      setTasks([]);
      setIsLoading(false);
    }
  }, [user, fetchTasks]);

  const handleToggleComplete = async (taskId: string) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      await updateTask(taskId, { completed: !task.completed });
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        )
      );
    } catch (error) {
      toast.error('Failed to update task.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task.');
    }
  };

  const handleAddTask = () => {
    setIsAddTaskModalOpen(true);
  };

  const handleTaskSave = async (newTask: Task) => {
    try {
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
      setIsAddTaskModalOpen(false);
      toast.success('Task added');
    } catch (error) {
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

      {/* Task list with delete option */}
      <div>
        <TaskList
          tasks={sortedTasks}
          onToggleComplete={handleToggleComplete}
          isLoading={firebaseLoading || isLoading}
        />
        {/* TaskList does not expose a delete button, so we add them below each card */}
        {!firebaseLoading && !isLoading && sortedTasks.length > 0 && (
          <div className="mt-2 space-y-3">
            {sortedTasks.map((task) => (
              <div
                key={task.id}
                className="flex justify-end"
                style={{ marginTop: '-2.5rem', marginBottom: '0.5rem' }}
              >
                <motion.div whileHover={{ scale: 1.2 }}>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteTask(task.id)}
                    title="Delete Task"
                  >
                    <Trash2 className="w-5 h-5 text-destructive" />
                  </Button>
                </motion.div>
              </div>
            ))}
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

