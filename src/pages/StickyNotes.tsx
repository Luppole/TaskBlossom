
import React, { useState, useEffect } from 'react';
import { useSupabase } from '@/contexts/SupabaseContext';
import { Task } from '@/types/task';
import { Loader2, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import TaskModal from '@/components/tasks/TaskModal';
import { toast } from 'sonner';
import StickyNoteBoard from '@/components/sticky-notes/StickyNoteBoard';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const StickyNotes: React.FC = () => {
  const {
    user,
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    loading: supabaseLoading,
  } = useSupabase();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('dueDate');

  useEffect(() => {
    if (!supabaseLoading) {
      fetchTasks();
    }
  }, [supabaseLoading]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      if (user) {
        const fetchedTasks = await getTasks();
        setTasks(fetchedTasks);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

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
      
      if (user) {
        await updateTask(taskId, { completed: !taskToToggle.completed });
      }
    } catch (error) {
      console.error('Error updating task completion:', error);
      toast.error('Failed to update task');
      fetchTasks(); // Refresh on error
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      // Optimistically remove from UI
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      
      if (user) {
        await deleteTask(taskId);
        toast.success('Task deleted');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      fetchTasks(); // Refresh on error
    }
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
        setTasks((prev) => [newTask, ...prev]);
      }
      
      setIsAddTaskModalOpen(false);
      toast.success('Task added');
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    }
  };

  // Filter tasks based on search query
  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.notes && task.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sort tasks based on the selected sort option
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityValues = { high: 0, medium: 1, low: 2 };
      return priorityValues[a.priority] - priorityValues[b.priority];
    } else if (sortBy === 'dueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    } else if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Sticky Notes Board</h1>
          <p className="text-muted-foreground">Organize your tasks visually</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="dueDate">Due Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <Button onClick={() => setIsAddTaskModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <StickyNoteBoard 
          tasks={sortedTasks} 
          onToggleComplete={handleToggleComplete}
          onDeleteTask={handleDeleteTask}
        />
      )}
      
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

export default StickyNotes;
