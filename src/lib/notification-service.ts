
import { Task } from '@/types/task';
import { toast } from 'sonner';
import { messaging, requestNotificationPermission } from './firebase';

export const setupTaskNotifications = async (tasks: Task[], settings: { 
  taskReminders: boolean, 
  overdueAlerts: boolean 
}) => {
  if (!settings.taskReminders && !settings.overdueAlerts) {
    return;
  }
  
  // Check if permissions are granted
  const hasPermission = await requestNotificationPermission();
  
  if (!hasPermission) {
    return;
  }
  
  // Set up task reminders
  if (settings.taskReminders) {
    setupTaskReminders(tasks);
  }
  
  // Set up overdue alerts
  if (settings.overdueAlerts) {
    checkOverdueTasks(tasks);
  }
};

const setupTaskReminders = (tasks: Task[]) => {
  // Clear any existing reminder timers
  if (window.taskReminderTimers) {
    window.taskReminderTimers.forEach(timerId => clearTimeout(timerId));
  }
  
  window.taskReminderTimers = [];
  
  // Only set reminders for incomplete tasks with future due dates
  const tasksWithDueDates = tasks.filter(task => 
    !task.completed && 
    task.dueDate && 
    task.dueDate > new Date()
  );
  
  tasksWithDueDates.forEach(task => {
    if (!task.dueDate) return;
    
    const now = new Date();
    const dueTime = task.dueDate.getTime();
    
    // Set reminder for 30 minutes before due time
    const reminderTime = dueTime - (30 * 60 * 1000) - now.getTime();
    
    // Only set reminders for future times
    if (reminderTime > 0) {
      const timerId = setTimeout(() => {
        showTaskReminder(task);
      }, reminderTime);
      
      window.taskReminderTimers.push(timerId);
    }
  });
};

const checkOverdueTasks = (tasks: Task[]) => {
  const now = new Date();
  
  // Find tasks that are overdue and not completed
  const overdueTasks = tasks.filter(task => 
    !task.completed && 
    task.dueDate && 
    task.dueDate < now
  );
  
  // Show alerts for overdue tasks
  overdueTasks.forEach(task => {
    showOverdueAlert(task);
  });
};

const showTaskReminder = (task: Task) => {
  // Show in-app toast notification
  toast.info(
    `Task reminder: ${task.title}`, 
    {
      description: `Due in 30 minutes`,
      duration: 10000,
      action: {
        label: 'View',
        onClick: () => {
          // You could add navigation to the task details here
          console.log('View task', task.id);
        }
      }
    }
  );
  
  // Also send a browser notification
  if (Notification.permission === 'granted') {
    new Notification('Task Reminder', {
      body: `"${task.title}" is due in 30 minutes`,
      icon: '/favicon.ico'
    });
  }
};

const showOverdueAlert = (task: Task) => {
  // Show in-app toast notification
  toast.error(
    `Overdue task: ${task.title}`, 
    {
      description: 'This task is past its due date',
      duration: 10000,
      action: {
        label: 'Complete',
        onClick: () => {
          // You could add a function to mark as complete here
          console.log('Complete task', task.id);
        }
      }
    }
  );
  
  // Also send a browser notification
  if (Notification.permission === 'granted') {
    new Notification('Overdue Task', {
      body: `"${task.title}" is overdue`,
      icon: '/favicon.ico'
    });
  }
};

// Add this to the global Window interface
declare global {
  interface Window {
    taskReminderTimers: number[];
  }
}

// Initialize the timers array if it doesn't exist
if (typeof window !== 'undefined' && !window.taskReminderTimers) {
  window.taskReminderTimers = [];
}
