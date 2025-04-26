
import { Task } from '@/types/task';
import { toast } from 'sonner';
import { messaging, requestNotificationPermission, messagingSupported } from './firebase';

// Keep track of whether we've already set up notifications
let notificationsInitialized = false;
let notificationRequestInProgress = false;
let lastNotificationRequestTime = 0;
const NOTIFICATION_REQUEST_COOLDOWN = 60000; // 1 minute cooldown

export const setupTaskNotifications = async (tasks: Task[], settings: { 
  taskReminders: boolean, 
  overdueAlerts: boolean 
}) => {
  // If notifications are already initialized or settings are disabled, don't proceed
  if (notificationsInitialized || (!settings.taskReminders && !settings.overdueAlerts)) {
    return;
  }
  
  // Prevent multiple concurrent requests
  if (notificationRequestInProgress) {
    return;
  }
  
  // Check cooldown period
  const now = Date.now();
  if (now - lastNotificationRequestTime < NOTIFICATION_REQUEST_COOLDOWN) {
    // Use in-app notifications only
    setupLocalNotifications(tasks, settings);
    return;
  }
  
  notificationRequestInProgress = true;
  lastNotificationRequestTime = now;
  
  try {
    notificationsInitialized = true;
    
    // If messaging is not supported (e.g., in development environment), just use toast notifications
    if (!messagingSupported) {
      console.log('Firebase messaging not supported in this environment. Using in-app notifications only.');
      setupLocalNotifications(tasks, settings);
      return;
    }
    
    // Check if permissions are granted
    const hasPermission = await requestNotificationPermission();
    
    if (!hasPermission) {
      console.log('Notification permission not granted');
      // Still continue with in-app notifications
    }
    
    // Set up task reminders and overdue alerts
    setupLocalNotifications(tasks, settings);
    
  } catch (error) {
    console.error('Error setting up notifications:', error);
    setupLocalNotifications(tasks, settings);
  } finally {
    notificationRequestInProgress = false;
  }
};

const setupLocalNotifications = (tasks: Task[], settings: { taskReminders: boolean, overdueAlerts: boolean }) => {
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
          // You could add logic here to mark the task as complete
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

export const getFirebaseNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    console.log("Browser notification permission status:", permission);
    return permission;
  } catch (error) {
    console.error("Error checking notification permission:", error);
    return "denied";
  }
};
