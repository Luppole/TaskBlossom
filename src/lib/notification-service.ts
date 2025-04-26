
import { Task } from '@/types/task';
import { toast } from 'sonner';

export const setupTaskNotifications = async (tasks: Task[], settings: { 
  taskReminders: boolean, 
  overdueAlerts: boolean 
}) => {
  if (!settings.taskReminders && !settings.overdueAlerts) {
    return;
  }
  
  // Skip notification setup if browser doesn't support notifications
  if (!("Notification" in window)) {
    return;
  }
  
  // Skip permission request in this service - handle it in Settings page
  if (Notification.permission !== 'granted') {
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
    window.taskReminderTimers = [];
  } else {
    window.taskReminderTimers = [];
  }
  
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
      
      // Convert NodeJS.Timeout to number for TypeScript compatibility
      window.taskReminderTimers.push(timerId as unknown as number);
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
  // Show in-app toast notification only (in-app Sonner toast)
  toast.info(
    `Task reminder: ${task.title}`, 
    {
      description: `Due in 30 minutes`,
      duration: 10000,
      action: {
        label: 'View',
        onClick: () => {
          // Navigate to tasks page
          window.location.href = '/tasks';
        }
      }
    }
  );
};

const showOverdueAlert = (task: Task) => {
  // Show in-app toast notification only (in-app Sonner toast)
  toast.error(
    `Overdue task: ${task.title}`, 
    {
      description: 'This task is past its due date',
      duration: 10000,
      action: {
        label: 'Complete',
        onClick: () => {
          console.log('Complete task', task.id);
        }
      }
    }
  );
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

// Add a new function that doesn't trigger errors
export const getFirebaseNotificationPermission = async () => {
  // First check if we already know the permission status
  if (Notification.permission === 'granted') {
    return 'granted';
  } else if (Notification.permission === 'denied') {
    return 'denied';
  }
  
  // Only ask if permission state is "default" (not decided)
  try {
    // Store the last time we requested permission to avoid frequent requests
    const permissionKey = 'notification_permission_last_request';
    const lastRequested = localStorage.getItem(permissionKey);
    
    // Don't ask again if we asked in the last 24 hours
    if (lastRequested && (Date.now() - parseInt(lastRequested, 10)) < 86400000) {
      return Notification.permission;
    }
    
    const permission = await Notification.requestPermission();
    localStorage.setItem(permissionKey, Date.now().toString());
    return permission;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return "denied";
  }
};
