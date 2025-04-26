
import { Task } from '@/types/task';

// Setup notification permissions
const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support desktop notification');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Check if notification is supported
const notificationsSupported = () => {
  return 'Notification' in window;
};

// Setup notifications for tasks
export const setupTaskNotifications = (tasks: Task[], settings: { taskReminders: boolean, overdueAlerts: boolean }) => {
  if (!notificationsSupported() || !settings.taskReminders) {
    return;
  }

  // Request permission if not already granted
  requestNotificationPermission().then((permissionGranted) => {
    if (!permissionGranted) {
      console.log('Notification permission denied');
      return;
    }

    console.log('Setting up task notifications for', tasks.length, 'tasks');
    
    // Setup notifications for upcoming tasks
    tasks.forEach(task => {
      if (task.completed || !task.dueDate) return;
      
      const now = new Date();
      const dueDate = new Date(task.dueDate);
      
      // Set reminder for 30 minutes before due time
      const reminderTime = new Date(dueDate.getTime() - 30 * 60000);
      
      // If reminder time is in the future, schedule it
      if (reminderTime > now) {
        const timeUntilReminder = reminderTime.getTime() - now.getTime();
        setTimeout(() => {
          new Notification('Task Reminder', {
            body: `Your task "${task.title}" is due in 30 minutes`,
            icon: '/favicon.ico'
          });
        }, timeUntilReminder);
      }
      
      // If overdue alerts are enabled and the task is overdue
      if (settings.overdueAlerts && dueDate < now && !task.completed) {
        // Notify about overdue task
        new Notification('Task Overdue', {
          body: `Your task "${task.title}" is overdue`,
          icon: '/favicon.ico'
        });
      }
    });
  });
};
