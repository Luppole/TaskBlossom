
import { Task } from '@/types/task';
import { isToday, subDays, startOfDay, isAfter, isBefore, isSameDay } from 'date-fns';

export const calculateStreak = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0;
  
  // Sort tasks by completedAt date
  const completedTasks = tasks
    .filter(task => task.completed && task.completedAt)
    .sort((a, b) => {
      const dateA = new Date(a.completedAt!);
      const dateB = new Date(b.completedAt!);
      return dateB.getTime() - dateA.getTime();
    });
  
  if (completedTasks.length === 0) return 0;
  
  let streak = 0;
  let currentDate = startOfDay(new Date());
  let hadCompletionToday = false;
  
  // Check if there's any task completed today
  hadCompletionToday = completedTasks.some(task => 
    isToday(new Date(task.completedAt!))
  );
  
  if (!hadCompletionToday) {
    // If no tasks completed today, check yesterday's tasks
    currentDate = subDays(currentDate, 1);
  }
  
  // Count consecutive days with completed tasks
  while (true) {
    const tasksForDay = completedTasks.filter(task => 
      isSameDay(new Date(task.completedAt!), currentDate)
    );
    
    if (tasksForDay.length === 0) break;
    
    streak++;
    currentDate = subDays(currentDate, 1);
  }
  
  return streak;
};
