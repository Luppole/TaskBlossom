
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { motivationalQuotes } from '@/data/taskData';
import ProductivityBar from '@/components/common/ProductivityBar';
import AddTaskButton from '@/components/common/AddTaskButton';
import TaskModal from '@/components/tasks/TaskModal';
import FocusMode from '@/components/focus/FocusMode';
import { Task } from '@/types/task';
import { toast } from 'sonner';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useSupabase } from '@/contexts/SupabaseContext';
import { setupTaskNotifications } from '@/lib/notification-service';
import { calculateStreak } from '@/utils/streak-calculator';
import TodayHeader from '@/components/today/TodayHeader';
import TaskSection from '@/components/today/TaskSection';

let notificationsSetupComplete = false;

const Today: React.FC = () => {
  const { 
    user,
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    loading: supabaseLoading 
  } = useSupabase();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [quote, setQuote] = useState('');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  useKeyboardShortcuts({
    onNewTask: () => setIsAddTaskModalOpen(true)
  });
  
  const fetchTasks = useCallback(async () => {
    if (isLoading && !supabaseLoading) {
      try {
        if (user) {
          const fetchedTasks = await getTasks();
          setTasks(fetchedTasks);
        } else {
          setTasks([]);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to load tasks');
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    }
  }, [getTasks, user, isLoading, supabaseLoading]);
  
  const memoizedQuote = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    return motivationalQuotes[randomIndex];
  }, []);
  
  useEffect(() => {
    setQuote(memoizedQuote);
    
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    if (!hasVisitedBefore) {
      setIsFirstVisit(true);
      localStorage.setItem('hasVisitedBefore', 'true');
    } else {
      setIsFirstVisit(false);
    }
  }, [memoizedQuote]);
  
  useEffect(() => {
    if (!supabaseLoading) {
      console.log("Supabase loading complete, fetching tasks now");
      fetchTasks();
    }
  }, [fetchTasks, supabaseLoading]);
  
  useEffect(() => {
    if (!notificationsSetupComplete && user && tasks.length > 0) {
      notificationsSetupComplete = true;
      setupTaskNotifications(tasks, {
        taskReminders: true,
        overdueAlerts: true
      });
    }
  }, [tasks, user]);
  
  const handleToggleComplete = async (taskId: string) => {
    try {
      const taskToToggle = tasks.find(t => t.id === taskId);
      if (!taskToToggle) return;
      
      const now = new Date().toISOString();
      
      setTasks(prev => 
        prev.map(t => t.id === taskId ? { 
          ...t, 
          completed: !t.completed,
          completedAt: !t.completed ? now : null 
        } : t)
      );
      
      if (user) {
        await updateTask(taskId, { 
          completed: !taskToToggle.completed,
          completedAt: !taskToToggle.completed ? now : null
        });
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
      toast.error('Failed to update task');
      
      const taskToToggle = tasks.find(t => t.id === taskId);
      if (!taskToToggle) return;
      
      setTasks(prev => 
        prev.map(t => t.id === taskId ? { 
          ...t, 
          completed: taskToToggle.completed,
          completedAt: taskToToggle.completedAt 
        } : t)
      );
    }
  };
  
  const handleDeleteTask = async (taskId: string) => {
    try {
      const taskToDelete = tasks.find(t => t.id === taskId);
      if (!taskToDelete) return;
      
      setTasks(prev => prev.filter(t => t.id !== taskId));
      
      if (user) {
        await deleteTask(taskId);
        toast.success('Task deleted');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      
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
        setTasks(prev => [savedTask, ...prev]);
      } else {
        setTasks(prev => [newTask, ...prev]);
      }
      setIsAddTaskModalOpen(false);
      toast.success('Task added');
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to add task');
    }
  };
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌞 Good Morning';
    if (hour < 18) return '☀️ Good Afternoon';
    return '🌙 Good Evening';
  };

  const todaysTasks = tasks.filter(task => {
    const isToday = task.dueDate && 
      task.dueDate.toDateString() === new Date().toDateString();
      
    const isOverdue = task.dueDate && 
      task.dueDate < new Date() && 
      !task.completed;
      
    return isToday || isOverdue;
  });

  const getFilteredTasks = () => {
    switch (filter) {
      case 'completed':
        return todaysTasks.filter(task => task.completed);
      case 'pending':
        return todaysTasks.filter(task => !task.completed);
      case 'overdue':
        return todaysTasks.filter(task => 
          task.dueDate && 
          task.dueDate < new Date() && 
          !task.completed
        );
      default:
        return todaysTasks;
    }
  };

  const filteredTasks = getFilteredTasks();
  const pendingCount = todaysTasks.filter(task => !task.completed).length;
  const streak = calculateStreak(tasks);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8">
      <TodayHeader
        greeting={`${getGreeting()}, ${user?.user_metadata?.display_name || 'Guest'}`}
        quote={quote}
        isFirstVisit={isFirstVisit}
        onStartFocusMode={() => setIsFocusModeOpen(true)}
      />
      
      <section className="mb-6">
        <ProductivityBar tasks={todaysTasks} streak={streak} />
      </section>

      <TaskSection
        tasks={filteredTasks}
        filter={filter}
        onFilterChange={setFilter}
        onToggleComplete={handleToggleComplete}
        onDeleteTask={handleDeleteTask}
        isLoading={isLoading || supabaseLoading}
        user={user}
        pendingCount={pendingCount}
      />
      
      <AddTaskButton onClick={handleAddTask} />
      
      {isAddTaskModalOpen && (
        <TaskModal 
          isOpen={isAddTaskModalOpen}
          onClose={() => setIsAddTaskModalOpen(false)}
          onSave={handleTaskSave}
          initialDate={new Date()}
        />
      )}
      
      <FocusMode 
        isOpen={isFocusModeOpen}
        onClose={() => setIsFocusModeOpen(false)}
      />
    </div>
  );
};

export default Today;
